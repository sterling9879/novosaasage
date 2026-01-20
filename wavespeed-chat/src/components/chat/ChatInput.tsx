'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSend, FiMic, FiImage, FiSmile, FiCommand, FiX } from 'react-icons/fi';
import Image from 'next/image';
import { useChatStore } from '@/store/chatStore';
import { getBotById } from '@/lib/bots';

interface ChatInputProps {
  onSendMessage: (message: string, imageUrl?: string) => void;
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP.');
        return;
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Arquivo muito grande. Máximo 10MB.');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer upload');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !isUploading && message.length <= MAX_CHARS) {
      let imageUrl: string | undefined;

      // Upload image if selected
      if (selectedImage) {
        setIsUploading(true);
        try {
          imageUrl = await uploadImage(selectedImage);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Erro ao fazer upload da imagem. Tente novamente.');
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      onSendMessage(message.trim(), imageUrl);
      setMessage('');
      setShowQuickPrompts(false);
      removeImage();
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
    <div className="bg-white border-t border-[rgba(30,58,47,0.08)]">
      {/* Quick Prompts */}
      {showQuickPrompts && messages.length === 0 && (
        <div className="px-3 sm:px-4 py-2 border-b border-[rgba(30,58,47,0.08)] animate-fadeIn">
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] sm:text-xs text-[#6B6B6B] mb-1.5">Sugestões rápidas</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPrompt(prompt.text)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] sm:text-sm bg-[#F5F5F0] hover:bg-[#4A7C59]/10 active:bg-[#4A7C59]/15 text-[#1E3A2F] hover:text-[#4A7C59] rounded-full border border-[rgba(30,58,47,0.08)] transition-all duration-200"
                >
                  <span>{prompt.icon}</span>
                  <span>{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-2.5 sm:px-4 pt-2.5 sm:pt-4 pb-2 sm:pb-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleImageSelect}
          className="hidden"
        />

        <div className="max-w-4xl mx-auto">
          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-2 relative inline-block">
              <div className="relative rounded-xl overflow-hidden border border-[rgba(30,58,47,0.15)] bg-[#F5F5F0]">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={120}
                  height={120}
                  className="object-cover"
                  style={{ maxWidth: '120px', maxHeight: '120px' }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}

          <div
            className={`relative bg-white rounded-2xl border transition-all duration-300 ${
              isFocused
                ? 'border-[#4A7C59] ring-2 sm:ring-4 ring-[#4A7C5910] shadow-lg shadow-[#4A7C5908]'
                : 'border-[rgba(30,58,47,0.15)]'
            } ${isLoading || isUploading ? 'opacity-75' : ''}`}
          >
            {/* Selected Bot Badge */}
            {selectedBot && (
              <div className="absolute -top-3 left-3 sm:left-4 flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 bg-white rounded-full border border-[rgba(30,58,47,0.08)] shadow-sm text-[10px] sm:text-xs font-medium text-[#4A7C59]">
                <span>{selectedBot.icon}</span>
                <span className="truncate max-w-[100px] sm:max-w-none">{selectedBot.name}</span>
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
              className={`w-full resize-none bg-transparent px-3 sm:px-4 py-2.5 sm:py-4 pr-16 sm:pr-36 focus:outline-none max-h-[120px] sm:max-h-[200px] text-[14px] sm:text-[15px] text-[#1E3A2F] placeholder-[#8B8B8B] ${
                selectedBot ? 'pt-3.5 sm:pt-5' : ''
              }`}
              rows={1}
              disabled={isLoading}
            />

            {/* Action Buttons */}
            <div className="absolute right-2 bottom-2 flex items-center gap-0.5 sm:gap-1">
              {/* Desktop only buttons */}
              <button
                type="button"
                onClick={() => setShowQuickPrompts(!showQuickPrompts)}
                className={`hidden sm:block p-2 rounded-xl transition-all duration-200 ${
                  showQuickPrompts
                    ? 'bg-[#4A7C59,0.1)] text-[#4A7C59]'
                    : 'text-[#8B8B8B] hover:text-[#6B6B6B] hover:bg-[#EEEEE8]'
                }`}
                title="Sugestões (Ctrl+/)"
              >
                <FiCommand className="w-4.5 h-4.5" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  selectedImage
                    ? 'bg-[#4A7C59]/10 text-[#4A7C59]'
                    : 'text-[#8B8B8B] hover:text-[#6B6B6B] hover:bg-[#EEEEE8]'
                }`}
                title="Anexar imagem"
              >
                <FiImage className="w-4.5 h-4.5" />
              </button>
              <button
                type="button"
                className="hidden sm:block p-2 text-[#8B8B8B] hover:text-[#6B6B6B] hover:bg-[#EEEEE8] rounded-xl transition-all duration-200"
                title="Emoji"
              >
                <FiSmile className="w-4.5 h-4.5" />
              </button>
              {/* Send button - always visible */}
              <button
                type="submit"
                disabled={!message.trim() || isLoading || isUploading || isOverLimit}
                className={`p-2.5 sm:p-2.5 rounded-xl transition-all duration-300 ${
                  message.trim() && !isLoading && !isUploading && !isOverLimit
                    ? 'bg-gradient-to-r from-[#4A7C59] to-[#1E3A2F] text-white shadow-lg shadow-[#4A7C5930] hover:shadow-xl hover:shadow-[#4A7C5940] active:scale-95 sm:hover:scale-105'
                    : 'bg-[rgb(230,230,235)] text-[#8B8B8B] cursor-not-allowed'
                }`}
              >
                {isLoading || isUploading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiSend className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Footer - Hidden on mobile */}
          <div className="hidden sm:flex items-center justify-between mt-2.5 px-1">
            <div className="flex items-center gap-3">
              <p className="text-[11px] text-[#8B8B8B]">
                <kbd className="px-1.5 py-0.5 bg-white border border-[rgba(30,58,47,0.1)] rounded text-[10px] font-mono">Enter</kbd>
                {' '}enviar
                {' '}<span className="mx-1 text-[rgb(200,200,210)]">•</span>{' '}
                <kbd className="px-1.5 py-0.5 bg-white border border-[rgba(30,58,47,0.1)] rounded text-[10px] font-mono">Shift+Enter</kbd>
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
                          : 'bg-[#4A7C59]'
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
                        : 'text-[#8B8B8B]'
                    }`}
                  >
                    {charCount.toLocaleString()}/{MAX_CHARS.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mobile character counter - only when typing */}
          {charCount > 0 && (
            <div className="sm:hidden flex justify-end mt-1.5 px-1">
              <span
                className={`text-[10px] font-medium ${
                  isOverLimit
                    ? 'text-red-500'
                    : isNearLimit
                    ? 'text-orange-500'
                    : 'text-[#8B8B8B]'
                }`}
              >
                {charCount.toLocaleString()}/{MAX_CHARS.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
