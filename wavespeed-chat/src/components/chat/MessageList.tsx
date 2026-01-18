'use client';

import { useEffect, useRef, useState } from 'react';
import { FiUser, FiCopy, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { useChatStore } from '@/store/chatStore';
import { getBotById } from '@/lib/bots';

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function MessageActions({ content, onRegenerate }: { content: string; onRegenerate?: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-lg hover:bg-[rgba(104,65,234,0.1)] text-[rgb(134,134,146)] hover:text-[#6841ea] transition-all"
        title="Copiar"
      >
        {copied ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
      </button>
      {onRegenerate && (
        <button
          onClick={onRegenerate}
          className="p-1.5 rounded-lg hover:bg-[rgba(104,65,234,0.1)] text-[rgb(134,134,146)] hover:text-[#6841ea] transition-all"
          title="Regenerar"
        >
          <FiRefreshCw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function TypingIndicator({ botIcon, botColor }: { botIcon: string; botColor: string }) {
  return (
    <div className="flex gap-3 justify-start animate-fadeInUp">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-sm"
        style={{ backgroundColor: `${botColor}15` }}
      >
        {botIcon}
      </div>
      <div className="bg-white border border-[rgba(79,89,102,0.08)] rounded-2xl rounded-bl-md px-5 py-4 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-[#6841ea] rounded-full typing-dot" />
          <span className="w-2 h-2 bg-[#6841ea] rounded-full typing-dot" />
          <span className="w-2 h-2 bg-[#6841ea] rounded-full typing-dot" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ botIcon, botName, botDescription }: { botIcon: string; botName?: string; botDescription?: string }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md animate-fadeIn">
        <div className="relative inline-block">
          <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-[#6841ea15] to-[#8b5cf615] flex items-center justify-center text-4xl shadow-lg animate-float">
            {botIcon}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-[rgb(249,250,251)] flex items-center justify-center">
            <FiCheck className="w-3 h-3 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-[rgb(38,38,38)] mb-2">
          {botName ? `Usando ${botName}` : 'Comece uma conversa'}
        </h3>
        <p className="text-[rgb(134,134,146)] text-sm leading-relaxed">
          {botDescription || 'Selecione um modelo e envie uma mensagem para começar a conversar.'}
        </p>
      </div>
    </div>
  );
}

export default function MessageList() {
  const { messages, isLoading, selectedBotId } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedBot = selectedBotId ? getBotById(selectedBotId) : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <EmptyState
        botIcon={selectedBot?.icon || '💬'}
        botName={selectedBot?.name}
        botDescription={selectedBot?.description}
      />
    );
  }

  const botIcon = selectedBot?.icon || '🤖';
  const botColor = selectedBot?.color || '#6841ea';

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((message, index) => {
        const isUser = message.role === 'USER';
        const isLast = index === messages.length - 1;
        const showTime = isLast || messages[index + 1]?.role !== message.role;

        return (
          <div
            key={message.id}
            className={`group flex gap-3 animate-fadeInUp ${isUser ? 'justify-end' : 'justify-start'}`}
            style={{ animationDelay: `${Math.min(index * 50, 200)}ms` }}
          >
            {/* Avatar AI */}
            {!isUser && (
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-sm transition-transform duration-200 hover:scale-105"
                style={{ backgroundColor: `${botColor}15` }}
              >
                {botIcon}
              </div>
            )}

            {/* Message Content */}
            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
              <div
                className={`relative rounded-2xl px-4 py-3 transition-all duration-200 ${
                  isUser
                    ? 'bg-gradient-to-br from-[#6841ea] to-[#8b5cf6] text-white rounded-br-md shadow-lg shadow-[#6841ea25]'
                    : 'bg-white border border-[rgba(79,89,102,0.08)] text-[rgb(38,38,38)] rounded-bl-md shadow-sm hover:shadow-md'
                }`}
              >
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
              </div>

              {/* Message Footer */}
              <div className={`flex items-center gap-2 mt-1.5 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {showTime && (
                  <span className="text-[11px] text-[rgb(170,170,180)]">
                    {formatTime(new Date(message.createdAt))}
                  </span>
                )}
                {!isUser && <MessageActions content={message.content} />}
              </div>
            </div>

            {/* Avatar User */}
            {isUser && (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[rgb(235,235,240)] to-[rgb(225,225,230)] flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 hover:scale-105">
                <FiUser className="w-5 h-5 text-[rgb(100,100,110)]" />
              </div>
            )}
          </div>
        );
      })}

      {/* Typing Indicator */}
      {isLoading && <TypingIndicator botIcon={botIcon} botColor={botColor} />}

      <div ref={messagesEndRef} className="h-1" />
    </div>
  );
}
