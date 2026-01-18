'use client';

import { useChatStore } from '@/store/chatStore';
import ModelSelector from './ModelSelector';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

interface ChatAreaProps {
  onSendMessage: (message: string) => void;
}

export default function ChatArea({ onSendMessage }: ChatAreaProps) {
  const { currentConversationId } = useChatStore();

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <header className="border-b border-gray-200 px-4 py-3 flex items-center justify-between bg-white">
        <h1 className="text-lg font-semibold text-gray-800">
          {currentConversationId ? 'Conversa' : 'Nova Conversa'}
        </h1>
        <ModelSelector />
      </header>

      <MessageList />
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
}
