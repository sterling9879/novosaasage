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
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Image
          src={getProviderLogo(currentModel.provider)}
          alt={currentModel.provider}
          width={20}
          height={20}
          className="rounded"
        />
        <span className="text-sm font-medium text-gray-700">{currentModel.name}</span>
        <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 max-h-80 overflow-y-auto">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                setSelectedModel(model.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${
                model.id === selectedModel ? 'bg-primary-50' : ''
              }`}
            >
              <Image
                src={getProviderLogo(model.provider)}
                alt={model.provider}
                width={20}
                height={20}
                className="rounded"
              />
              <span className="text-sm text-gray-700">{model.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
