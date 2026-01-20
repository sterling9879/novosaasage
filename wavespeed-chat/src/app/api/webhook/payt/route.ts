import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendWelcomeEmail, sendPlanRenewalEmail } from '@/lib/brevo';

// Tipos do payload Payt
interface PaytPayload {
  integration_key: string;
  transaction_id: string;
  seller_id?: string;
  test?: boolean;
  type: string; // order, upsell, subscription, etc
  status: string;
  tangible?: boolean;
  cart_id?: string;

  customer: {
    name: string;
    fake_email?: boolean;
    email: string;
    doc?: string;
    phone?: string;
    ip?: string;
    code?: string;
  };

  product: {
    name: string;
    price: number;
    code?: string;
    sku?: string;
    type?: string;
    quantity?: number;
  };

  transaction: {
    payment_method?: string;
    payment_status?: string;
    total_price: number;
    quantity?: number;
    installments?: number;
    paid_at?: string;
  };

  subscription?: {
    code?: string;
    plan_name?: string;
    charges?: number;
    periodicity?: string;
    next_charge_at?: string;
    status?: string;
    started_at?: string;
  };

  started_at?: string;
  updated_at?: string;
}

// Configuração de planos por preço (em centavos)
const PLAN_CONFIG: Record<number, { plan: string; messagesLimit: number }> = {
  3700: { plan: 'basic', messagesLimit: 30 },   // R$ 37 - Plano Básico
  9700: { plan: 'pro', messagesLimit: 150 },    // R$ 97 - Plano Pro
};

// Detecta o plano baseado no preço
function detectPlan(priceInCents: number): { plan: string; messagesLimit: number } {
  // Procura por preço exato
  if (PLAN_CONFIG[priceInCents]) {
    return PLAN_CONFIG[priceInCents];
  }

  // Fallback: se não encontrar, usa o plano básico
  console.log(`Preço ${priceInCents} não mapeado, usando plano básico`);
  return { plan: 'basic', messagesLimit: 30 };
}

// Calcula a data de expiração (30 dias a partir de agora)
function calculateExpiration(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  return expiresAt;
}

// Gera senha aleatória
function generatePassword(length: number = 8): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  return password;
}

// Handler POST para receber webhooks
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse do body
    const payload: PaytPayload = await request.json();

    // Log da requisição recebida
    console.log('=== PAYT WEBHOOK RECEBIDO ===');
    console.log('Transaction ID:', payload.transaction_id);
    console.log('Status:', payload.status);
    console.log('Type:', payload.type);
    console.log('Customer:', payload.customer?.email);
    console.log('Test Mode:', payload.test);
    console.log('============================');

    // Validar integration_key
    const expectedKey = process.env.PAYT_INTEGRATION_KEY;
    if (!expectedKey) {
      console.error('PAYT_INTEGRATION_KEY não configurada no .env');
      // Ainda retorna 200 para não dar erro no Payt, mas loga
    } else if (payload.integration_key !== expectedKey) {
      console.error('Integration key inválida:', payload.integration_key);
      return NextResponse.json(
        { success: false, error: 'Integration key inválida' },
        { status: 401 }
      );
    }

    // Verificar se já processamos essa transação
    const existingPurchase = await prisma.paytPurchase.findUnique({
      where: { transactionId: payload.transaction_id },
    });

    if (existingPurchase) {
      console.log('Transação já processada:', payload.transaction_id);
      // Atualiza o status se mudou
      if (existingPurchase.status !== payload.status) {
        await prisma.paytPurchase.update({
          where: { id: existingPurchase.id },
          data: {
            status: payload.status,
            rawPayload: JSON.stringify(payload),
            updatedAt: new Date(),
          },
        });
        console.log('Status atualizado de', existingPurchase.status, 'para', payload.status);
      }
      return NextResponse.json({ success: true, message: 'Transação já processada' });
    }

    // Criar registro do webhook
    let userId: string | null = null;
    let errorMessage: string | null = null;
    let userCreated = false;
    let generatedPassword: string | null = null;

    // Se status == paid, criar ou encontrar usuário
    if (payload.status === 'paid') {
      try {
        // Detectar plano baseado no preço
        const productPrice = payload.product?.price || payload.transaction?.total_price || 0;
        const planInfo = detectPlan(productPrice);
        const planExpiresAt = calculateExpiration();

        console.log('=== PLANO DETECTADO ===');
        console.log('Preço:', productPrice, 'centavos');
        console.log('Plano:', planInfo.plan);
        console.log('Limite diário:', planInfo.messagesLimit);
        console.log('Expira em:', planExpiresAt.toISOString());
        console.log('=======================');

        // Verificar se usuário já existe pelo email
        const existingUser = await prisma.user.findUnique({
          where: { email: payload.customer.email.toLowerCase() },
        });

        if (existingUser) {
          userId = existingUser.id;
          console.log('Usuário existente encontrado:', existingUser.email);

          // Atualiza/renova o plano do usuário
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: existingUser.name || payload.customer.name,
              phone: existingUser.phone || payload.customer.phone,
              cpf: existingUser.cpf || payload.customer.doc,
              // Atualiza plano (sempre pega o novo, pode ser upgrade ou renovação)
              plan: planInfo.plan,
              messagesLimit: planInfo.messagesLimit,
              planExpiresAt: planExpiresAt,
              // Reseta contador ao renovar
              messagesUsedToday: 0,
              lastResetAt: new Date(),
            },
          });

          console.log('Plano do usuário atualizado/renovado:', planInfo.plan);

          // Envia email de renovação
          try {
            const emailResult = await sendPlanRenewalEmail(
              existingUser.email,
              existingUser.name || payload.customer.name || 'Usuário',
              planInfo.plan
            );
            if (emailResult.success) {
              console.log('Email de renovação enviado:', emailResult.messageId);
            } else {
              console.error('Erro ao enviar email de renovação:', emailResult.error);
            }
          } catch (emailError) {
            console.error('Exceção ao enviar email de renovação:', emailError);
            // Não interrompe o fluxo
          }
        } else {
          // Criar novo usuário
          generatedPassword = generatePassword(10);
          const hashedPassword = await bcrypt.hash(generatedPassword, 10);

          const newUser = await prisma.user.create({
            data: {
              email: payload.customer.email.toLowerCase(),
              password: hashedPassword,
              name: payload.customer.name,
              phone: payload.customer.phone || null,
              cpf: payload.customer.doc || null,
              source: 'payt',
              // Campos de plano
              plan: planInfo.plan,
              messagesLimit: planInfo.messagesLimit,
              planExpiresAt: planExpiresAt,
              messagesUsedToday: 0,
              lastResetAt: new Date(),
            },
          });

          userId = newUser.id;
          userCreated = true;

          console.log('=== NOVO USUÁRIO CRIADO ===');
          console.log('Email:', newUser.email);
          console.log('Nome:', newUser.name);
          console.log('Plano:', planInfo.plan);
          console.log('Limite diário:', planInfo.messagesLimit);
          console.log('Senha temporária:', generatedPassword);
          console.log('===========================');

          // Envia email de boas-vindas com as credenciais
          try {
            const emailResult = await sendWelcomeEmail(
              newUser.email,
              newUser.name || 'Usuário',
              generatedPassword,
              planInfo.plan
            );
            if (emailResult.success) {
              console.log('Email de boas-vindas enviado:', emailResult.messageId);
            } else {
              console.error('Erro ao enviar email de boas-vindas:', emailResult.error);
            }
          } catch (emailError) {
            console.error('Exceção ao enviar email de boas-vindas:', emailError);
            // Não interrompe o fluxo, usuário já foi criado
          }
        }
      } catch (userError) {
        console.error('Erro ao criar/buscar usuário:', userError);
        errorMessage = userError instanceof Error ? userError.message : 'Erro ao criar usuário';
      }
    }

    // Salvar registro da compra
    const purchase = await prisma.paytPurchase.create({
      data: {
        transactionId: payload.transaction_id,
        status: payload.status,
        type: payload.type || 'order',
        customerName: payload.customer.name,
        customerEmail: payload.customer.email.toLowerCase(),
        customerDoc: payload.customer.doc || null,
        customerPhone: payload.customer.phone || null,
        productCode: payload.product?.code || null,
        productName: payload.product?.name || null,
        productPrice: payload.product?.price || null,
        paymentMethod: payload.transaction?.payment_method || null,
        totalPrice: payload.transaction?.total_price || 0,
        subscriptionCode: payload.subscription?.code || null,
        subscriptionPlan: payload.subscription?.plan_name || null,
        rawPayload: JSON.stringify(payload),
        processed: payload.status === 'paid',
        errorMessage,
        userId,
      },
    });

    const duration = Date.now() - startTime;
    console.log(`Webhook processado em ${duration}ms`);

    // Resposta de sucesso
    return NextResponse.json({
      success: true,
      message: payload.status === 'paid'
        ? userCreated
          ? 'Usuário criado com sucesso'
          : 'Compra registrada, usuário já existia'
        : 'Webhook recebido',
      purchaseId: purchase.id,
      userCreated,
      // Só retorna a senha em ambiente de desenvolvimento para debug
      ...(process.env.NODE_ENV === 'development' && generatedPassword
        ? { generatedPassword }
        : {}),
    });
  } catch (error) {
    console.error('Erro no webhook Payt:', error);

    // Tenta salvar o erro mesmo assim
    try {
      const rawBody = await request.text().catch(() => '');
      await prisma.paytPurchase.create({
        data: {
          transactionId: `error-${Date.now()}`,
          status: 'error',
          type: 'unknown',
          customerName: 'Unknown',
          customerEmail: 'error@webhook.local',
          totalPrice: 0,
          rawPayload: rawBody || 'Parse error',
          processed: false,
          errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });
    } catch {
      // Ignora erro ao salvar log de erro
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao processar webhook',
      },
      { status: 500 }
    );
  }
}

// Handler GET para verificar se o endpoint está funcionando
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'Payt Webhook',
    timestamp: new Date().toISOString(),
  });
}
