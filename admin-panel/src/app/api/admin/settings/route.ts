import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Lista de chaves de configuração suportadas
const SETTING_KEYS = [
  'wavespeed_api_key',
  'brevo_api_key',
  'email_sender_name',
  'email_sender_address',
  'payt_integration_key',
];

// Função para mascarar valor sensível
function maskValue(value: string | null, isSensitive: boolean = true): string | null {
  if (!value) return null;
  if (!isSensitive) return value;
  if (value.length <= 12) return '***';
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Busca todas as configurações
    const settings = await prisma.settings.findMany({
      where: { key: { in: SETTING_KEYS } },
    });

    // Monta objeto de resposta
    const settingsMap: Record<string, { hasValue: boolean; value: string | null }> = {};

    for (const key of SETTING_KEYS) {
      const setting = settings.find(s => s.key === key);
      const isSensitive = key.includes('api_key') || key.includes('integration_key');
      settingsMap[key] = {
        hasValue: !!setting?.value,
        value: maskValue(setting?.value || null, isSensitive),
      };
    }

    // Retorna também no formato antigo para compatibilidade
    const wavespeedSetting = settings.find(s => s.key === 'wavespeed_api_key');

    return NextResponse.json({
      // Formato antigo (compatibilidade)
      hasApiKey: !!wavespeedSetting?.value,
      apiKey: wavespeedSetting?.value ? `${wavespeedSetting.value.slice(0, 8)}...${wavespeedSetting.value.slice(-4)}` : null,
      // Novo formato
      settings: settingsMap,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Suporta formato antigo (apenas apiKey) e novo (settings objeto)
    if (body.apiKey !== undefined) {
      // Formato antigo - apenas wavespeed_api_key
      if (!body.apiKey) {
        return NextResponse.json({ error: 'API Key é obrigatória' }, { status: 400 });
      }

      await prisma.settings.upsert({
        where: { key: 'wavespeed_api_key' },
        update: { value: body.apiKey },
        create: { key: 'wavespeed_api_key', value: body.apiKey },
      });

      return NextResponse.json({ success: true });
    }

    // Novo formato - múltiplas configurações
    if (body.settings) {
      const updates: Promise<any>[] = [];

      for (const [key, value] of Object.entries(body.settings)) {
        if (!SETTING_KEYS.includes(key)) {
          continue; // Ignora chaves não permitidas
        }

        if (value === null || value === undefined || value === '') {
          // Se valor vazio, não atualiza (mantém o existente)
          continue;
        }

        updates.push(
          prisma.settings.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) },
          })
        );
      }

      await Promise.all(updates);

      return NextResponse.json({ success: true, updated: updates.length });
    }

    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
