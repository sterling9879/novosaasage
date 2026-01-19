'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import ChatArea from '@/components/chat/ChatArea';
import { useChatStore } from '@/store/chatStore';
import { getBotById } from '@/lib/bots';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    setConversations,
    setCurrentConversationId,
    setMessages,
    addMessage,
    selectedModel,
    selectedBotId,
    currentConversationId,
    setIsLoading,
    reset,
    addConversation,
    setSidebarOpen,
    setSelectedBotId,
  } = useChatStore();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchConversations();
    }
  }, [session]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleNewConversation = useCallback(() => {
    reset();
    setSidebarOpen(false);
  }, [reset, setSidebarOpen]);

  const handleSelectConversation = useCallback(
    async (id: string) => {
      setCurrentConversationId(id);
      setSelectedBotId(null);
      setSidebarOpen(false);

      try {
        const response = await fetch(`/api/conversations/${id}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
    },
    [setCurrentConversationId, setMessages, setSidebarOpen, setSelectedBotId]
  );

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/conversations?id=${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          if (currentConversationId === id) {
            reset();
          }
          fetchConversations();
        }
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    },
    [currentConversationId, reset]
  );

  const handleSendMessage = useCallback(
    async (message: string) => {
      setIsLoading(true);

      // Add user message optimistically
      const tempUserMessage = {
        id: `temp-${Date.now()}`,
        role: 'USER' as const,
        content: message,
        createdAt: new Date().toISOString(),
      };
      addMessage(tempUserMessage);

      // Get bot info for title
      const bot = selectedBotId ? getBotById(selectedBotId) : null;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            conversationId: currentConversationId,
            model: selectedModel,
            botId: selectedBotId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao enviar mensagem');
        }

        // Update conversation ID if it's a new conversation
        if (!currentConversationId && data.conversationId) {
          setCurrentConversationId(data.conversationId);
          const title = bot ? `${bot.icon} ${bot.name}` : message.substring(0, 50);
          addConversation({
            id: data.conversationId,
            title,
            model: selectedModel,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        // Add assistant message
        addMessage(data.assistantMessage);

        // Refresh conversations list
        fetchConversations();
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar mensagem';
        // Add error message
        addMessage({
          id: `error-${Date.now()}`,
          role: 'ASSISTANT',
          content: `Erro: ${errorMessage}`,
          createdAt: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      currentConversationId,
      selectedModel,
      selectedBotId,
      setIsLoading,
      addMessage,
      setCurrentConversationId,
      addConversation,
    ]
  );

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A7C59]"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[#F5F5F0]">
      <Sidebar
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />
      <ChatArea onSendMessage={handleSendMessage} />
    </div>
  );
}
