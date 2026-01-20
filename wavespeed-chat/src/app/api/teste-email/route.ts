import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail, sendPlanRenewalEmail } from '@/lib/brevo';

/**
 * Endpoint de teste para envio de emails via Brevo
 *
 * POST /api/teste-email
 * Body: { type: 'welcome' | 'renewal', email: string, nome: string, plano?: string, senha?: string }
 */
export async function POST(request: NextRequest) {
  console.log('=== [TESTE-EMAIL] Requisição recebida ===');
  console.log('[TESTE-EMAIL] Method:', request.method);
  console.log('[TESTE-EMAIL] URL:', request.url);
  console.log('[TESTE-EMAIL] NODE_ENV:', process.env.NODE_ENV);

  // Adiciona headers CORS para permitir chamadas do admin panel
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-test-key',
  };

  try {
    const body = await request.json();
    console.log('[TESTE-EMAIL] Body recebido:', JSON.stringify(body, null, 2));

    const { type, email, nome, plano = 'basic', senha = 'SenhaTest123' } = body;

    if (!email || !nome) {
      console.log('[TESTE-EMAIL] Erro: Email ou nome faltando');
      return NextResponse.json(
        { success: false, error: 'Email e nome são obrigatórios' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('=== [TESTE-EMAIL] ENVIANDO ===');
    console.log('[TESTE-EMAIL] Tipo:', type);
    console.log('[TESTE-EMAIL] Email:', email);
    console.log('[TESTE-EMAIL] Nome:', nome);
    console.log('[TESTE-EMAIL] Plano:', plano);
    console.log('==============================');

    let result;

    if (type === 'welcome') {
      console.log('[TESTE-EMAIL] Chamando sendWelcomeEmail...');
      result = await sendWelcomeEmail(email, nome, senha, plano);
    } else if (type === 'renewal') {
      console.log('[TESTE-EMAIL] Chamando sendPlanRenewalEmail...');
      result = await sendPlanRenewalEmail(email, nome, plano);
    } else {
      console.log('[TESTE-EMAIL] Erro: Tipo inválido:', type);
      return NextResponse.json(
        { success: false, error: 'Tipo inválido. Use "welcome" ou "renewal"' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('[TESTE-EMAIL] Resultado:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('[TESTE-EMAIL] Sucesso! MessageId:', result.messageId);
      return NextResponse.json({
        success: true,
        message: `Email de ${type === 'welcome' ? 'boas-vindas' : 'renovação'} enviado com sucesso`,
        messageId: result.messageId,
      }, { headers: corsHeaders });
    } else {
      console.log('[TESTE-EMAIL] Falha:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error('[TESTE-EMAIL] Exceção:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * OPTIONS - Para CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-test-key',
    },
  });
}

/**
 * GET /api/teste-email
 * Retorna informações sobre o endpoint de teste
 */
export async function GET() {
  // Verifica se as configurações do Brevo estão disponíveis
  const hasBrevoEnvKey = !!process.env.BREVO_API_KEY;

  console.log('[TESTE-EMAIL] GET - Verificando configuração');
  console.log('[TESTE-EMAIL] BREVO_API_KEY env:', hasBrevoEnvKey ? 'Configurada' : 'Não configurada');

  return NextResponse.json({
    status: 'ok',
    endpoint: 'Teste de Email Brevo',
    brevoEnvConfigured: hasBrevoEnvKey,
    note: 'A configuração também pode vir do banco de dados (admin panel)',
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
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}
