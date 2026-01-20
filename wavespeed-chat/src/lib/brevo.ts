/**
 * Servico de envio de emails via Brevo API
 * Documentacao: https://developers.brevo.com/reference/sendtransacemail
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

interface BrevoEmailParams {
  to: {
    email: string;
    name: string;
  };
  subject: string;
  htmlContent: string;
}

interface BrevoResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envia um email via Brevo API
 */
async function sendEmail(params: BrevoEmailParams): Promise<BrevoResponse> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.error('BREVO_API_KEY nao configurada');
    return { success: false, error: 'BREVO_API_KEY nao configurada' };
  }

  const senderName = process.env.EMAIL_SENDER_NAME || 'Sage IA';
  const senderEmail = process.env.EMAIL_SENDER_ADDRESS || 'contato@sage.com';

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [params.to],
    subject: params.subject,
    htmlContent: params.htmlContent,
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro Brevo:', response.status, errorData);
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Gera o HTML do email de boas-vindas
 */
function generateWelcomeEmailHTML(
  nome: string,
  email: string,
  senha: string,
  plano: string
): string {
  const urlPlataforma = process.env.NEXT_PUBLIC_APP_URL || 'https://sage.app';
  const planoBadge = plano === 'pro'
    ? '<span style="background: linear-gradient(135deg, #C9A227, #B8941F); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">PRO</span>'
    : '<span style="background: #4A7C59; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">BASICO</span>';

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4A7C59 0%, #1E3A2F 100%); color: white; padding: 50px 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Bem-vindo ao Sage IA!</h1>
            <p style="margin: 15px 0 0; opacity: 0.9; font-size: 16px;">Seu acesso foi liberado com sucesso</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; color: #1E3A2F; margin-bottom: 25px; line-height: 1.6;">
                Ola, <strong>${nome}</strong>!
            </p>

            <p style="font-size: 16px; color: #444; margin-bottom: 30px; line-height: 1.6;">
                Sua compra foi confirmada e seu acesso a plataforma Sage IA ja esta disponivel.
                Abaixo estao suas credenciais de acesso:
            </p>

            <!-- Plano Badge -->
            <div style="text-align: center; margin-bottom: 25px;">
                Seu plano: ${planoBadge}
            </div>

            <!-- Credentials Box -->
            <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="margin: 0 0 20px; color: #1E3A2F; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                    🔐 Seus Dados de Acesso
                </h3>

                <div style="margin-bottom: 15px;">
                    <span style="font-weight: 600; color: #6B6B6B; font-size: 13px; display: block; margin-bottom: 5px;">Email:</span>
                    <div style="background-color: #ffffff; padding: 12px 15px; border-radius: 8px; border: 1px solid #dee2e6; font-family: 'Courier New', monospace; font-size: 14px; color: #1E3A2F;">
                        ${email}
                    </div>
                </div>

                <div>
                    <span style="font-weight: 600; color: #6B6B6B; font-size: 13px; display: block; margin-bottom: 5px;">Senha:</span>
                    <div style="background-color: #ffffff; padding: 12px 15px; border-radius: 8px; border: 1px solid #dee2e6; font-family: 'Courier New', monospace; font-size: 14px; color: #1E3A2F; letter-spacing: 1px;">
                        ${senha}
                    </div>
                </div>
            </div>

            <!-- Warning -->
            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 25px 0; font-size: 14px; color: #856404;">
                ⚠️ <strong>Importante:</strong> Recomendamos que voce altere sua senha no primeiro acesso para maior seguranca.
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
                <a href="${urlPlataforma}/login" style="display: inline-block; background: linear-gradient(135deg, #4A7C59 0%, #1E3A2F 100%); color: white; text-decoration: none; padding: 16px 45px; border-radius: 50px; font-size: 16px; font-weight: 600;">
                    Acessar a Plataforma →
                </a>
            </div>

            <!-- Divider -->
            <div style="height: 1px; background-color: #e9ecef; margin: 35px 0;"></div>

            <!-- Features -->
            <div style="margin: 25px 0;">
                <h3 style="color: #1E3A2F; margin-bottom: 20px; font-size: 16px;">O que voce pode fazer agora:</h3>

                <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                    <span style="font-size: 18px; margin-right: 12px;">✅</span>
                    <span style="color: #444; font-size: 14px; line-height: 1.5;">Acesse todas as IAs disponiveis: GPT-5, Claude 3.7, Gemini Pro e mais</span>
                </div>

                <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                    <span style="font-size: 18px; margin-right: 12px;">✅</span>
                    <span style="color: #444; font-size: 14px; line-height: 1.5;">Use as ferramentas especializadas: tradutor, escritor, corretor e mais</span>
                </div>

                <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                    <span style="font-size: 18px; margin-right: 12px;">✅</span>
                    <span style="color: #444; font-size: 14px; line-height: 1.5;">Envie imagens para analise pela IA</span>
                </div>

                <div style="display: flex; align-items: flex-start;">
                    <span style="font-size: 18px; margin-right: 12px;">✅</span>
                    <span style="color: #444; font-size: 14px; line-height: 1.5;">Acesse os tutoriais completos na Central de Ajuda</span>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; color: #6B6B6B; font-size: 13px;">
            <p style="margin: 0 0 10px;">
                Duvidas? Acesse nossa <a href="${urlPlataforma}/tutorials" style="color: #4A7C59; text-decoration: none;">Central de Ajuda</a>
            </p>
            <p style="margin: 15px 0 0; font-size: 12px; color: #adb5bd;">
                Este email foi enviado automaticamente. Por favor, nao responda.
            </p>
            <p style="margin: 10px 0 0; font-size: 11px; color: #adb5bd;">
                Sage IA - A inteligencia artificial que fala a verdade.
            </p>
        </div>
    </div>
</body>
</html>
`;
}

/**
 * Envia email de boas-vindas para novo usuario
 */
export async function sendWelcomeEmail(
  email: string,
  nome: string,
  senha: string,
  plano: string = 'basic'
): Promise<BrevoResponse> {
  const htmlContent = generateWelcomeEmailHTML(nome, email, senha, plano);

  console.log('=== ENVIANDO EMAIL DE BOAS-VINDAS ===');
  console.log('Para:', email);
  console.log('Nome:', nome);
  console.log('Plano:', plano);
  console.log('=====================================');

  return sendEmail({
    to: {
      email,
      name: nome,
    },
    subject: '🎉 Bem-vindo ao Sage IA! Seu acesso esta liberado',
    htmlContent,
  });
}

/**
 * Envia email de renovacao de plano
 */
export async function sendPlanRenewalEmail(
  email: string,
  nome: string,
  plano: string
): Promise<BrevoResponse> {
  const urlPlataforma = process.env.NEXT_PUBLIC_APP_URL || 'https://sage.app';
  const planLabel = plano === 'pro' ? 'Pro' : 'Basico';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4A7C59 0%, #1E3A2F 100%); color: white; padding: 50px 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 15px;">🔄</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Plano Renovado!</h1>
            <p style="margin: 15px 0 0; opacity: 0.9; font-size: 16px;">Seu acesso foi renovado com sucesso</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; color: #1E3A2F; margin-bottom: 25px; line-height: 1.6;">
                Ola, <strong>${nome}</strong>!
            </p>

            <p style="font-size: 16px; color: #444; margin-bottom: 30px; line-height: 1.6;">
                Sua renovacao do <strong>Plano ${planLabel}</strong> foi confirmada.
                Voce tem mais 30 dias de acesso a todas as funcionalidades do Sage IA!
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
                <a href="${urlPlataforma}" style="display: inline-block; background: linear-gradient(135deg, #4A7C59 0%, #1E3A2F 100%); color: white; text-decoration: none; padding: 16px 45px; border-radius: 50px; font-size: 16px; font-weight: 600;">
                    Continuar Usando →
                </a>
            </div>

            <p style="font-size: 14px; color: #6B6B6B; text-align: center;">
                Obrigado por continuar conosco! 💚
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; color: #6B6B6B; font-size: 13px;">
            <p style="margin: 0; font-size: 11px; color: #adb5bd;">
                Sage IA - A inteligencia artificial que fala a verdade.
            </p>
        </div>
    </div>
</body>
</html>
`;

  return sendEmail({
    to: {
      email,
      name: nome,
    },
    subject: '🔄 Plano renovado! Seu acesso ao Sage IA continua',
    htmlContent,
  });
}
