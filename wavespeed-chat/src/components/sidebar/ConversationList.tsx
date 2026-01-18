'use client';

import { FiMessageSquare, FiTrash2 } from 'react-icons/fi';
import { useChatStore } from '@/store/chatStore';
import { Conversation } from '@/types';

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export default function ConversationList({
  onSelectConversation,
  onDeleteConversation,
}: ConversationListProps) {
  const { conversations, currentConversationId } = useChatStore();

  if (conversations.length === 0) {
    return (
      <div className="px-3 py-4 text-center">
        <p className="text-sm text-gray-500">Nenhuma conversa ainda</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation: Conversation) => (
        <div
          key={conversation.id}
          className={`group flex items-center gap-2 px-3 py-2 mx-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
            currentConversationId === conversation.id ? 'bg-gray-100' : ''
          }`}
          onClick={() => onSelectConversation(conversation.id)}
        >
          <FiMessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="flex-1 text-sm text-gray-700 truncate">
            {conversation.title || 'Nova conversa'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteConversation(conversation.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
          >
            <FiTrash2 className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      ))}
    </div>
  );
}
