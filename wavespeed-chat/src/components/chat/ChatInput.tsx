'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSend, FiPaperclip } from 'react-icons/fi';
import { useChatStore } from '@/store/chatStore';
import { getBotById } from '@/lib/bots';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isLoading, selectedBotId } = useChatStore();
  const selectedBot = selectedBotId ? getBotById(selectedBotId) : null;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const placeholder = selectedBot
    ? `Pergunte ao ${selectedBot.name}...`
    : 'Me pergunte qualquer coisa...';

  return (
    <form onSubmit={handleSubmit} className="border-t border-[rgba(79,89,102,0.08)] p-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-[rgb(249,250,251)] rounded-2xl border border-[rgba(79,89,102,0.08)] focus-within:border-[#6841ea] focus-within:ring-2 focus-within:ring-[#6841ea20] transition-all">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent px-4 py-3 pr-24 focus:outline-none max-h-[200px] text-[15px] text-[rgb(38,38,38)] placeholder-[rgb(134,134,146)]"
            rows={1}
            disabled={isLoading}
          />

          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <button
              type="button"
              className="p-2 text-[rgb(134,134,146)] hover:text-[rgb(38,38,38)] hover:bg-[rgb(245,245,245)] rounded-lg transition-colors"
              title="Anexar arquivo"
            >
              <FiPaperclip className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="p-2 bg-[#6841ea] text-white rounded-lg hover:bg-[#5b35d4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-xs text-[rgb(134,134,146)]">
            Enter para enviar • Shift+Enter para nova linha
          </p>
          {selectedBot && (
            <p className="text-xs text-[#6841ea] font-medium">
              {selectedBot.icon} {selectedBot.name}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
