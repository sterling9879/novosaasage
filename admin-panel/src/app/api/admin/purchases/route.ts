import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const purchases = await prisma.paytPurchase.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Calcular estatísticas
    const stats = {
      total: purchases.length,
      paid: purchases.filter((p) => p.status === 'paid').length,
      totalRevenue: purchases
        .filter((p) => p.status === 'paid')
        .reduce((acc, p) => acc + (p.totalPrice || 0), 0),
      usersCreated: purchases.filter((p) => p.userId && p.status === 'paid').length,
    };

    return NextResponse.json({ purchases, stats });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ error: 'Erro ao buscar compras' }, { status: 500 });
  }
}
