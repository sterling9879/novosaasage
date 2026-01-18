import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { chatWithAI, buildPromptWithHistory } from '@/lib/wavespeed';
import { getBotById } from '@/lib/bots';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { message, conversationId, model, botId } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 });
    }

    // Get bot system prompt if a bot is selected
    const bot = botId ? getBotById(botId) : null;
    const systemPrompt = bot?.systemPrompt || null;

    let conversation;
    let existingMessages: Array<{ role: string; content: string }> = [];

    // Debug: Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    console.log('Session user ID:', session.user.id);
    console.log('User exists in DB:', !!userExists);

    if (!userExists) {
      return NextResponse.json(
        { error: `Usuário não encontrado no banco. ID: ${session.user.id}. Faça logout e login novamente.` },
        { status: 401 }
      );
    }

    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId, userId: session.user.id },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
      existingMessages = conversation?.messages || [];
    }

    if (!conversation) {
      const title = bot ? `${bot.icon} ${bot.name}` : message.substring(0, 50);
      conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
          title,
          model: model || 'google/gemini-2.5-flash',
        },
      });
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId: session.user.id,
        role: 'USER',
        content: message,
      },
    });

    // Build prompt with history and system prompt
    const prompt = buildPromptWithHistory(existingMessages, message, systemPrompt);

    // Call WaveSpeed API
    const aiResponse = await chatWithAI(prompt, model || conversation.model);

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId: session.user.id,
        role: 'ASSISTANT',
        content: aiResponse,
        model: model || conversation.model,
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // Update user message count
    await prisma.user.update({
      where: { id: session.user.id },
      data: { messagesUsed: { increment: 1 } },
    });

    return NextResponse.json({
      conversationId: conversation.id,
      userMessage: {
        id: userMessage.id,
        role: 'USER',
        content: message,
        createdAt: userMessage.createdAt,
      },
      assistantMessage: {
        id: assistantMessage.id,
        role: 'ASSISTANT',
        content: aiResponse,
        model: model || conversation.model,
        createdAt: assistantMessage.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'Erro ao processar mensagem';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
