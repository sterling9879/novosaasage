'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FiChevronDown } from 'react-icons/fi';
import { MODELS, getProviderLogo } from '@/lib/models';
import { useChatStore } from '@/store/chatStore';

export default function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { selectedModel, setSelectedModel } = useChatStore();

  const currentModel = MODELS.find((m) => m.id === selectedModel) || MODELS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-[rgba(30,58,47,0.1)] rounded-lg hover:bg-[#F5F5F0] transition-colors"
      >
        <Image
          src={getProviderLogo(currentModel.provider)}
          alt={currentModel.provider}
          width={20}
          height={20}
          className="rounded w-5 h-5 sm:w-5 sm:h-5"
        />
        <span className="hidden sm:inline text-sm font-medium text-[#1E3A2F]">{currentModel.name}</span>
        <FiChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B6B6B] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-56 sm:w-64 bg-white border border-[rgba(30,58,47,0.1)] rounded-xl shadow-lg z-50 py-1 max-h-80 overflow-y-auto">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                setSelectedModel(model.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F5F5F0] transition-colors ${
                model.id === selectedModel ? 'bg-[#4A7C5910]' : ''
              }`}
            >
              <Image
                src={getProviderLogo(model.provider)}
                alt={model.provider}
                width={20}
                height={20}
                className="rounded"
              />
              <span className="text-sm text-[#1E3A2F]">{model.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
