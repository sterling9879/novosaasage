'use client';

import { FiMessageSquare, FiTrash2, FiClock } from 'react-icons/fi';
import { useChatStore } from '@/store/chatStore';
import { Conversation } from '@/types';

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  searchQuery?: string;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function ConversationList({
  onSelectConversation,
  onDeleteConversation,
  searchQuery = '',
}: ConversationListProps) {
  const { conversations, currentConversationId } = useChatStore();

  const filteredConversations = conversations.filter((conv) =>
    (conv.title || 'Nova conversa').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[rgb(249,250,251)] flex items-center justify-center mb-3">
          <FiMessageSquare className="w-5 h-5 text-[rgb(170,170,180)]" />
        </div>
        <p className="text-sm font-medium text-[rgb(38,38,38)] mb-1">Nenhuma conversa</p>
        <p className="text-xs text-[rgb(170,170,180)]">Comece uma nova conversa acima</p>
      </div>
    );
  }

  if (filteredConversations.length === 0 && searchQuery) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[rgb(249,250,251)] flex items-center justify-center mb-3">
          <span className="text-xl">🔍</span>
        </div>
        <p className="text-sm font-medium text-[rgb(38,38,38)] mb-1">Nenhum resultado</p>
        <p className="text-xs text-[rgb(170,170,180)]">Tente outro termo de busca</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 space-y-1">
      {filteredConversations.map((conversation: Conversation, index: number) => {
        const isActive = currentConversationId === conversation.id;
        const conversationDate = new Date(conversation.updatedAt || conversation.createdAt);

        return (
          <div
            key={conversation.id}
            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 animate-fadeIn ${
              isActive
                ? 'bg-[#6841ea10] text-[#6841ea]'
                : 'hover:bg-[rgb(249,250,251)] text-[rgb(38,38,38)]'
            }`}
            style={{ animationDelay: `${index * 30}ms` }}
            onClick={() => onSelectConversation(conversation.id)}
          >
            {/* Active indicator */}
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#6841ea] rounded-r-full" />
            )}

            {/* Icon */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                isActive ? 'bg-[#6841ea20]' : 'bg-[rgb(245,245,250)]'
              }`}
            >
              <FiMessageSquare
                className={`w-4 h-4 ${isActive ? 'text-[#6841ea]' : 'text-[rgb(170,170,180)]'}`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate ${
                  isActive ? 'text-[#6841ea]' : 'text-[rgb(38,38,38)]'
                }`}
              >
                {conversation.title || 'Nova conversa'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <FiClock className="w-3 h-3 text-[rgb(170,170,180)]" />
                <span className="text-[10px] text-[rgb(170,170,180)]">
                  {formatRelativeTime(conversationDate)}
                </span>
              </div>
            </div>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(conversation.id);
              }}
              className={`p-1.5 rounded-lg transition-all ${
                isActive
                  ? 'opacity-100 hover:bg-[#6841ea20] text-[#6841ea]'
                  : 'opacity-0 group-hover:opacity-100 hover:bg-red-50 text-[rgb(170,170,180)] hover:text-red-500'
              }`}
              title="Excluir conversa"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
