import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail, sendPlanRenewalEmail } from '@/lib/brevo';

/**
 * Endpoint de teste para envio de emails via Brevo
 *
 * POST /api/teste-email
 * Body: { type: 'welcome' | 'renewal', email: string, nome: string, plano?: string, senha?: string }
 */
export async function POST(request: NextRequest) {
  // Verifica se está em ambiente de desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    // Em produção, verifica se há uma chave de teste
    const testKey = request.headers.get('x-test-key');
    if (testKey !== process.env.EMAIL_TEST_KEY) {
      return NextResponse.json(
        { success: false, error: 'Endpoint de teste não disponível em produção' },
        { status: 403 }
      );
    }
  }

  try {
    const body = await request.json();
    const { type, email, nome, plano = 'basic', senha = 'SenhaTest123' } = body;

    if (!email || !nome) {
      return NextResponse.json(
        { success: false, error: 'Email e nome são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('=== TESTE DE EMAIL ===');
    console.log('Tipo:', type);
    console.log('Email:', email);
    console.log('Nome:', nome);
    console.log('Plano:', plano);
    console.log('======================');

    let result;

    if (type === 'welcome') {
      result = await sendWelcomeEmail(email, nome, senha, plano);
    } else if (type === 'renewal') {
      result = await sendPlanRenewalEmail(email, nome, plano);
    } else {
      return NextResponse.json(
        { success: false, error: 'Tipo inválido. Use "welcome" ou "renewal"' },
        { status: 400 }
      );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Email de ${type === 'welcome' ? 'boas-vindas' : 'renovação'} enviado com sucesso`,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro no endpoint de teste:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/teste-email
 * Retorna informações sobre o endpoint de teste
 */
export async function GET() {
  const hasBrevoKey = !!process.env.BREVO_API_KEY;

  return NextResponse.json({
    status: 'ok',
    endpoint: 'Teste de Email Brevo',
    brevoConfigured: hasBrevoKey,
    usage: {
      method: 'POST',
      body: {
        type: 'welcome | renewal',
        email: 'email@exemplo.com',
        nome: 'Nome do Usuário',
        plano: 'basic | pro (opcional, default: basic)',
        senha: 'senha123 (opcional, apenas para welcome)',
      },
    },
    examples: [
      {
        description: 'Email de boas-vindas',
        body: { type: 'welcome', email: 'usuario@email.com', nome: 'João Silva', plano: 'pro', senha: 'MinhaSenha123' },
      },
      {
        description: 'Email de renovação',
        body: { type: 'renewal', email: 'usuario@email.com', nome: 'João Silva', plano: 'basic' },
      },
    ],
  });
}
