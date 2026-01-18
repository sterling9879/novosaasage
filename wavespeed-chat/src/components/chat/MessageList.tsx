'use client';

import { useEffect, useRef } from 'react';
import { FiUser } from 'react-icons/fi';
import { useChatStore } from '@/store/chatStore';
import { getBotById } from '@/lib/bots';

export default function MessageList() {
  const { messages, isLoading, selectedBotId } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedBot = selectedBotId ? getBotById(selectedBotId) : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#6841ea15] flex items-center justify-center text-3xl">
            {selectedBot?.icon || '💬'}
          </div>
          <h3 className="text-lg font-semibold text-[rgb(38,38,38)] mb-2">
            {selectedBot ? `Usando ${selectedBot.name}` : 'Comece uma conversa'}
          </h3>
          <p className="text-[rgb(134,134,146)] text-sm">
            {selectedBot
              ? selectedBot.description
              : 'Selecione um modelo e envie uma mensagem para começar.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 animate-fadeIn ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
        >
          {message.role === 'ASSISTANT' && (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
              style={{ backgroundColor: selectedBot ? `${selectedBot.color}15` : '#6841ea15' }}
            >
              {selectedBot?.icon || '🤖'}
            </div>
          )}

          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 ${
              message.role === 'USER'
                ? 'bg-[#6841ea] text-white'
                : 'bg-white border border-[rgba(79,89,102,0.08)] text-[rgb(38,38,38)]'
            }`}
          >
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
          </div>

          {message.role === 'USER' && (
            <div className="w-9 h-9 rounded-xl bg-[rgb(245,245,245)] flex items-center justify-center flex-shrink-0">
              <FiUser className="w-5 h-5 text-[rgb(134,134,146)]" />
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-3 justify-start animate-fadeIn">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
            style={{ backgroundColor: selectedBot ? `${selectedBot.color}15` : '#6841ea15' }}
          >
            {selectedBot?.icon || '🤖'}
          </div>
          <div className="bg-white border border-[rgba(79,89,102,0.08)] rounded-2xl px-4 py-3">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-[rgb(134,134,146)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-[rgb(134,134,146)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-[rgb(134,134,146)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
