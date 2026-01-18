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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        messagesUsed: true,
        messagesLimit: true,
        createdAt: true,
        _count: {
          select: {
            conversations: true,
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Create CSV content
    const headers = [
      'ID',
      'Email',
      'Nome',
      'Admin',
      'Mensagens Usadas',
      'Limite de Mensagens',
      'Conversas',
      'Total Mensagens',
      'Data de Cadastro',
    ];

    const rows = users.map((user) => [
      user.id,
      user.email,
      user.name || '',
      user.isAdmin ? 'Sim' : 'Não',
      user.messagesUsed.toString(),
      user.messagesLimit.toString(),
      user._count.conversations.toString(),
      user._count.messages.toString(),
      new Date(user.createdAt).toLocaleString('pt-BR'),
    ]);

    // Generate CSV
    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(';')),
    ].join('\n');

    // Add BOM for Excel UTF-8 compatibility
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    const filename = `usuarios_sage_ia_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json({ error: 'Erro ao exportar usuários' }, { status: 500 });
  }
}
