import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const setting = await prisma.settings.findUnique({
      where: { key: 'wavespeed_api_key' },
    });

    return NextResponse.json({
      hasApiKey: !!setting?.value,
      apiKey: setting?.value ? `${setting.value.slice(0, 8)}...${setting.value.slice(-4)}` : null,
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

    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key é obrigatória' }, { status: 400 });
    }

    await prisma.settings.upsert({
      where: { key: 'wavespeed_api_key' },
      update: { value: apiKey },
      create: { key: 'wavespeed_api_key', value: apiKey },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
