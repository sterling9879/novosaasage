import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { chatWithAI, buildPromptWithHistory, getImageDescription, buildPromptWithImage } from '@/lib/wavespeed';
import { getBotById } from '@/lib/bots';

// Verifica se é um novo dia e reseta o contador se necessário
function isNewDay(lastResetAt: Date | null): boolean {
  if (!lastResetAt) return true;

  const now = new Date();
  const lastReset = new Date(lastResetAt);

  // Compara ano, mês e dia
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { message, conversationId, model, botId, imageUrl } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 });
    }

    // Buscar usuário com dados do plano
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: `Usuário não encontrado. Faça logout e login novamente.` },
        { status: 401 }
      );
    }

    // ============================================
    // VERIFICAÇÃO DE PLANO E LIMITES
    // ============================================

    // 1. Verificar se o plano expirou
    if (user.planExpiresAt && new Date(user.planExpiresAt) < new Date()) {
      return NextResponse.json({
        error: 'PLAN_EXPIRED',
        message: 'Seu plano expirou. Renove para continuar usando.',
        planExpired: true,
        expiresAt: user.planExpiresAt,
      }, { status: 403 });
    }

    // 2. Reset diário se necessário
    let currentUsage = user.messagesUsedToday;
    if (isNewDay(user.lastResetAt)) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          messagesUsedToday: 0,
          lastResetAt: new Date(),
        },
      });
      currentUsage = 0;
      console.log('Contador diário resetado para usuário:', user.email);
    }

    // 3. Verificar se atingiu o limite diário
    if (currentUsage >= user.messagesLimit) {
      return NextResponse.json({
        error: 'LIMIT_REACHED',
        message: 'Você atingiu seu limite diário de mensagens.',
        limitReached: true,
        currentUsage,
        limit: user.messagesLimit,
        plan: user.plan,
        resetsAt: getNextMidnight(),
      }, { status: 403 });
    }

    // ============================================
    // PROCESSAMENTO DA MENSAGEM
    // ============================================

    // Process image if provided
    let imageDescription: string | null = null;
    let imageError: string | null = null;
    if (imageUrl) {
      try {
        console.log('Processing image:', imageUrl);
        imageDescription = await getImageDescription(imageUrl);
        console.log('Image description obtained:', imageDescription?.substring(0, 100));
      } catch (error) {
        console.error('Error processing image:', error);
        imageError = error instanceof Error ? error.message : 'Erro ao processar imagem';
      }
    }

    // Get bot system prompt if a bot is selected
    const bot = botId ? getBotById(botId) : null;
    const systemPrompt = bot?.systemPrompt || null;

    let conversation;
    let existingMessages: Array<{ role: string; content: string }> = [];

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

    // Build prompt with history, system prompt, and image description if available
    const prompt = imageDescription
      ? buildPromptWithImage(existingMessages, message, imageDescription, systemPrompt)
      : buildPromptWithHistory(existingMessages, message, systemPrompt);

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

    // Update user message count (contador diário)
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        messagesUsedToday: { increment: 1 },
        messagesUsed: { increment: 1 }, // Mantém compatibilidade
      },
    });

    // Build response with optional image error warning
    let finalResponse = aiResponse;
    if (imageUrl && imageError) {
      finalResponse = `⚠️ *Erro ao processar imagem: ${imageError}*\n\n${aiResponse}`;
    }

    // Calcula uso após esta mensagem
    const newUsage = currentUsage + 1;

    return NextResponse.json({
      conversationId: conversation.id,
      userMessage: {
        id: userMessage.id,
        role: 'USER',
        content: message,
        createdAt: userMessage.createdAt,
        imageUrl: imageUrl || null,
      },
      assistantMessage: {
        id: assistantMessage.id,
        role: 'ASSISTANT',
        content: finalResponse,
        model: model || conversation.model,
        createdAt: assistantMessage.createdAt,
      },
      // Informações de uso para o frontend
      usage: {
        current: newUsage,
        limit: user.messagesLimit,
        plan: user.plan,
        remaining: user.messagesLimit - newUsage,
        resetsAt: getNextMidnight(),
      },
    });
  } catch (error: unknown) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'Erro ao processar mensagem';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
