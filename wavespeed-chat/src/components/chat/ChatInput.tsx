'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSend, FiMic, FiImage, FiSmile, FiCommand } from 'react-icons/fi';
import { useChatStore } from '@/store/chatStore';
import { getBotById } from '@/lib/bots';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const MAX_CHARS = 4000;

const quickPrompts = [
  { icon: '💡', text: 'Explique de forma simples' },
  { icon: '📝', text: 'Resuma em tópicos' },
  { icon: '🔍', text: 'Analise este texto' },
  { icon: '🌍', text: 'Traduza para inglês' },
];

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isLoading, selectedBotId, messages } = useChatStore();
  const selectedBot = selectedBotId ? getBotById(selectedBotId) : null;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && message.length <= MAX_CHARS) {
      onSendMessage(message.trim());
      setMessage('');
      setShowQuickPrompts(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    // Toggle quick prompts with Ctrl/Cmd + /
    if (e.key === '/' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setShowQuickPrompts(!showQuickPrompts);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setMessage((prev) => prev ? `${prev}\n\n${promptText}: ` : `${promptText}: `);
    setShowQuickPrompts(false);
    textareaRef.current?.focus();
  };

  const placeholder = selectedBot
    ? `Pergunte ao ${selectedBot.name}...`
    : 'Me pergunte qualquer coisa...';

  const charCount = message.length;
  const charPercentage = (charCount / MAX_CHARS) * 100;
  const isNearLimit = charPercentage > 80;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="border-t border-[rgba(79,89,102,0.08)] bg-white/80 backdrop-blur-lg">
      {/* Quick Prompts */}
      {showQuickPrompts && messages.length === 0 && (
        <div className="px-4 py-3 border-b border-[rgba(79,89,102,0.08)] animate-fadeIn">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-[rgb(134,134,146)] mb-2">Sugestões rápidas</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPrompt(prompt.text)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[rgb(249,250,251)] hover:bg-[rgba(104,65,234,0.1)] text-[rgb(38,38,38)] hover:text-[#6841ea] rounded-full border border-[rgba(79,89,102,0.08)] transition-all duration-200"
                >
                  <span>{prompt.icon}</span>
                  <span>{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4">
        <div className="max-w-4xl mx-auto">
          <div
            className={`relative bg-[rgb(249,250,251)] rounded-2xl border transition-all duration-300 ${
              isFocused
                ? 'border-[#6841ea] ring-4 ring-[#6841ea10] shadow-lg shadow-[#6841ea08]'
                : 'border-[rgba(79,89,102,0.08)]'
            } ${isLoading ? 'opacity-75' : ''}`}
          >
            {/* Selected Bot Badge */}
            {selectedBot && (
              <div className="absolute -top-3 left-4 flex items-center gap-1.5 px-2.5 py-0.5 bg-white rounded-full border border-[rgba(79,89,102,0.08)] shadow-sm text-xs font-medium text-[#6841ea]">
                <span>{selectedBot.icon}</span>
                <span>{selectedBot.name}</span>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className={`w-full resize-none bg-transparent px-4 py-4 pr-36 focus:outline-none max-h-[200px] text-[15px] text-[rgb(38,38,38)] placeholder-[rgb(170,170,180)] ${
                selectedBot ? 'pt-5' : ''
              }`}
              rows={1}
              disabled={isLoading}
            />

            {/* Action Buttons */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowQuickPrompts(!showQuickPrompts)}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  showQuickPrompts
                    ? 'bg-[rgba(104,65,234,0.1)] text-[#6841ea]'
                    : 'text-[rgb(170,170,180)] hover:text-[rgb(134,134,146)] hover:bg-[rgb(245,245,245)]'
                }`}
                title="Sugestões (Ctrl+/)"
              >
                <FiCommand className="w-4.5 h-4.5" />
              </button>
              <button
                type="button"
                className="p-2 text-[rgb(170,170,180)] hover:text-[rgb(134,134,146)] hover:bg-[rgb(245,245,245)] rounded-xl transition-all duration-200"
                title="Imagem"
              >
                <FiImage className="w-4.5 h-4.5" />
              </button>
              <button
                type="button"
                className="p-2 text-[rgb(170,170,180)] hover:text-[rgb(134,134,146)] hover:bg-[rgb(245,245,245)] rounded-xl transition-all duration-200"
                title="Emoji"
              >
                <FiSmile className="w-4.5 h-4.5" />
              </button>
              <button
                type="submit"
                disabled={!message.trim() || isLoading || isOverLimit}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  message.trim() && !isLoading && !isOverLimit
                    ? 'bg-gradient-to-r from-[#6841ea] to-[#8b5cf6] text-white shadow-lg shadow-[#6841ea30] hover:shadow-xl hover:shadow-[#6841ea40] hover:scale-105'
                    : 'bg-[rgb(230,230,235)] text-[rgb(170,170,180)] cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiSend className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2.5 px-1">
            <div className="flex items-center gap-3">
              <p className="text-[11px] text-[rgb(170,170,180)]">
                <kbd className="px-1.5 py-0.5 bg-[rgb(245,245,245)] rounded text-[10px] font-mono">Enter</kbd>
                {' '}enviar
                {' '}<span className="mx-1 text-[rgb(200,200,210)]">•</span>{' '}
                <kbd className="px-1.5 py-0.5 bg-[rgb(245,245,245)] rounded text-[10px] font-mono">Shift+Enter</kbd>
                {' '}nova linha
              </p>
            </div>

            {/* Character Counter */}
            <div className="flex items-center gap-2">
              {charCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 bg-[rgb(235,235,240)] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isOverLimit
                          ? 'bg-red-500'
                          : isNearLimit
                          ? 'bg-orange-400'
                          : 'bg-[#6841ea]'
                      }`}
                      style={{ width: `${Math.min(charPercentage, 100)}%` }}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      isOverLimit
                        ? 'text-red-500'
                        : isNearLimit
                        ? 'text-orange-500'
                        : 'text-[rgb(170,170,180)]'
                    }`}
                  >
                    {charCount.toLocaleString()}/{MAX_CHARS.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
