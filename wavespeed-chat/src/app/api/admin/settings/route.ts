import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getApiKey, setApiKey } from '@/lib/wavespeed';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const apiKey = await getApiKey();

    // Return masked API key for security
    const maskedKey = apiKey
      ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
      : null;

    return NextResponse.json({ apiKey: maskedKey, hasApiKey: !!apiKey });
  } catch (error) {
    console.error('Settings error:', error);
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { apiKey } = await request.json();

    if (!apiKey?.trim()) {
      return NextResponse.json({ error: 'API Key é obrigatória' }, { status: 400 });
    }

    await setApiKey(apiKey.trim());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings error:', error);
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 });
  }
}
