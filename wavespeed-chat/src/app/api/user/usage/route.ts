import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Verifica se é um novo dia
function isNewDay(lastResetAt: Date | null): boolean {
  if (!lastResetAt) return true;

  const now = new Date();
  const lastReset = new Date(lastResetAt);

  return (
    now.getFullYear() !== lastReset.getFullYear() ||
    now.getMonth() !== lastReset.getMonth() ||
    now.getDate() !== lastReset.getDate()
  );
}

// Retorna a próxima meia-noite
function getNextMidnight(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        messagesUsedToday: true,
        messagesLimit: true,
        planExpiresAt: true,
        lastResetAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Reset diário se necessário
    let currentUsage = user.messagesUsedToday;
    if (isNewDay(user.lastResetAt)) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          messagesUsedToday: 0,
          lastResetAt: new Date(),
        },
      });
      currentUsage = 0;
    }

    // Verificar se o plano expirou
    const planExpired = user.planExpiresAt ? new Date(user.planExpiresAt) < new Date() : false;

    return NextResponse.json({
      plan: user.plan,
      current: currentUsage,
      limit: user.messagesLimit,
      remaining: Math.max(0, user.messagesLimit - currentUsage),
      planExpired,
      expiresAt: user.planExpiresAt,
      resetsAt: getNextMidnight(),
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    return NextResponse.json({ error: 'Erro ao buscar uso' }, { status: 500 });
  }
}
