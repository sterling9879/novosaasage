import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Busca configurações do Brevo no banco de dados
 */
async function getBrevoConfig() {
  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: ['brevo_api_key', 'email_sender_name', 'email_sender_address'],
      },
    },
  });

  const settingsMap = new Map(settings.map(s => [s.key, s.value]));

  return {
    apiKey: settingsMap.get('brevo_api_key') || null,
    senderName: settingsMap.get('email_sender_name') || 'Sage IA',
    senderEmail: settingsMap.get('email_sender_address') || 'contato@sage.com',
  };
}

/**
 * Gera HTML do email de teste
 */
function generateTestEmailHTML(nome: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px;">
        <div style="background: linear-gradient(135deg, #4A7C59 0%, #1E3A2F 100%); color: white; padding: 50px 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Email de Teste</h1>
            <p style="margin: 15px 0 0; opacity: 0.9; font-size: 16px;">Configuração do Brevo funcionando!</p>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; color: #1E3A2F; margin-bottom: 25px; line-height: 1.6;">
                Olá, <strong>${nome}</strong>!
            </p>
            <p style="font-size: 16px; color: #444; margin-bottom: 30px; line-height: 1.6;">
                Este é um email de teste enviado pelo painel administrativo do Sage IA.
                Se você está recebendo este email, significa que a integração com o Brevo está funcionando corretamente!
            </p>
            <div style="background-color: #d4edda; border: 1px solid #28a745; border-radius: 8px; padding: 15px; margin: 25px 0; font-size: 14px; color: #155724;">
                ✅ <strong>Sucesso!</strong> A configuração de email está funcionando.
            </div>
        </div>
        <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; color: #6B6B6B; font-size: 13px;">
            <p style="margin: 0; font-size: 11px; color: #adb5bd;">
                Sage IA - Painel Administrativo
            </p>
        </div>
    </div>
</body>
</html>
`;
}

export async function POST(request: NextRequest) {
  console.log('[ADMIN TEST-EMAIL] Requisição recebida');

  try {
    // Verifica autenticação admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      console.log('[ADMIN TEST-EMAIL] Não autorizado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { email, nome = 'Teste Admin' } = body;

    console.log('[ADMIN TEST-EMAIL] Email destino:', email);
    console.log('[ADMIN TEST-EMAIL] Nome:', nome);

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Busca configurações do banco
    const config = await getBrevoConfig();
    console.log('[ADMIN TEST-EMAIL] Config encontrada:', {
      hasApiKey: !!config.apiKey,
      senderName: config.senderName,
      senderEmail: config.senderEmail,
    });

    if (!config.apiKey) {
      return NextResponse.json(
        { success: false, error: 'API Key do Brevo não configurada' },
        { status: 400 }
      );
    }

    // Prepara payload para Brevo
    const payload = {
      sender: {
        name: config.senderName,
        email: config.senderEmail,
      },
      to: [{ email, name: nome }],
      subject: '✅ Teste de Email - Sage IA',
      htmlContent: generateTestEmailHTML(nome),
    };

    console.log('[ADMIN TEST-EMAIL] Enviando para Brevo...');

    // Envia para Brevo
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': config.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('[ADMIN TEST-EMAIL] Brevo response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[ADMIN TEST-EMAIL] Erro Brevo:', errorData);
      return NextResponse.json(
        { success: false, error: errorData.message || `Erro HTTP ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('[ADMIN TEST-EMAIL] Sucesso! MessageId:', data.messageId);

    return NextResponse.json({
      success: true,
      message: 'Email de teste enviado com sucesso!',
      messageId: data.messageId,
    });
  } catch (error) {
    console.error('[ADMIN TEST-EMAIL] Exceção:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
