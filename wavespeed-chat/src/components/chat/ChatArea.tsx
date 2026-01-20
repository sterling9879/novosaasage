'use client';

import { useState, useEffect } from 'react';
import { FiArrowRight, FiZap, FiStar, FiCpu, FiMenu } from 'react-icons/fi';
import { useChatStore } from '@/store/chatStore';
import ModelSelector from './ModelSelector';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import BotsGrid from './BotsGrid';
import UsageIndicator from './UsageIndicator';
import UpgradeModal from './UpgradeModal';
import { getBotById, BOTS } from '@/lib/bots';

interface ChatAreaProps {
  onSendMessage: (message: string, imageUrl?: string) => void;
}

export default function ChatArea({ onSendMessage }: ChatAreaProps) {
  const { currentConversationId, activeTab, selectedBotId, messages, setSelectedBotId, toggleSidebar } = useChatStore();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'manual' | 'limit' | 'expired'>('manual');

  const selectedBot = selectedBotId ? getBotById(selectedBotId) : null;

  const handleUpgradeClick = (reason: 'manual' | 'limit' | 'expired' = 'manual') => {
    setUpgradeReason(reason);
    setShowUpgradeModal(true);
  };

  // Escuta eventos de mostrar modal de upgrade
  useEffect(() => {
    const handleShowUpgradeModal = (event: CustomEvent<{ reason: 'limit' | 'expired' }>) => {
      setUpgradeReason(event.detail.reason);
      setShowUpgradeModal(true);
    };

    window.addEventListener('showUpgradeModal' as any, handleShowUpgradeModal);
    return () => {
      window.removeEventListener('showUpgradeModal' as any, handleShowUpgradeModal);
    };
  }, []);

  // Se estiver na aba de bots e não tiver bot selecionado, mostrar grid
  if (activeTab === 'bots' && !selectedBotId) {
    return <BotsGrid />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-[#F5F5F0] to-white">
      {/* Header */}
      <header className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-white/80 backdrop-blur-lg sticky top-0 z-10 border-b border-[rgba(30,58,47,0.05)]">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 -ml-1 text-[#6B6B6B] hover:text-[#1E3A2F] hover:bg-[#EEEEE8] rounded-xl transition-all"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          {selectedBot ? (
            <>
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-lg transition-transform hover:scale-105"
                style={{
                  backgroundColor: `${selectedBot.color}15`,
                  boxShadow: `0 4px 12px ${selectedBot.color}20`,
                }}
              >
                {selectedBot.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-[#1E3A2F] truncate">{selectedBot.name}</h1>
                  <span className="hidden sm:inline px-2 py-0.5 text-[10px] font-semibold bg-[#4A7C5915] text-[#4A7C59] rounded-full">
                    Online
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#6B6B6B] line-clamp-1 hidden sm:block">{selectedBot.description}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#4A7C59] to-[#1E3A2F] flex items-center justify-center shadow-lg flex-shrink-0">
                <FiCpu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-[#1E3A2F] truncate">
                  {currentConversationId ? 'Conversa' : 'Sage'}
                </h1>
                <p className="text-[11px] sm:text-xs text-[#6B6B6B] hidden sm:block">IA sem hipocrisia</p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <UsageIndicator onUpgradeClick={() => handleUpgradeClick('manual')} />
          {selectedBot && (
            <button
              onClick={() => setSelectedBotId(null)}
              className="hidden sm:block px-3 py-1.5 text-xs font-medium text-[#6B6B6B] hover:text-[#1E3A2F] hover:bg-[#EEEEE8] rounded-lg transition-all"
            >
              Trocar Bot
            </button>
          )}
          <ModelSelector />
        </div>
      </header>

      {/* Messages or Welcome */}
      {messages.length === 0 && !selectedBot ? <WelcomeScreen /> : <MessageList />}

      <ChatInput onSendMessage={onSendMessage} />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        limitReached={upgradeReason === 'limit'}
        planExpired={upgradeReason === 'expired'}
      />
    </div>
  );
}

function WelcomeScreen() {
  const { setSelectedBotId, setActiveTab, toggleSidebar } = useChatStore();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Bom dia');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Boa tarde');
    } else {
      setGreeting('Boa noite');
    }
  }, []);

  const quickTools = [
    { id: 'translator', icon: '🌐', name: 'Traduzir', color: '#4A7C59', desc: 'Traduza textos' },
    { id: 'summarizer', icon: '📋', name: 'Resumir', color: '#3B7A8C', desc: 'Resuma conteúdos' },
    { id: 'writer', icon: '✍️', name: 'Escrever', color: '#4A7C59', desc: 'Crie textos' },
    { id: 'grammar', icon: '📝', name: 'Gramática', color: '#C9A227', desc: 'Corrija erros' },
    { id: 'email', icon: '📧', name: 'E-mail', color: '#1E3A2F', desc: 'Escreva e-mails' },
    { id: 'code-helper', icon: '💻', name: 'Código', color: '#3B7A8C', desc: 'Ajuda com código' },
  ];

  const featuredBots = BOTS.filter((bot) => bot.isNew).slice(0, 3);

  const handleSelectTool = (toolId: string) => {
    setSelectedBotId(toolId);
  };

  const suggestions = [
    'Escreva um e-mail profissional para...',
    'Explique o conceito de...',
    'Crie um plano de estudos para...',
    'Analise este texto e sugira melhorias...',
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Hero */}
        <div className="text-center mb-8 sm:mb-12 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#4A7C5915] text-[#4A7C59] rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <FiZap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Sage — IA sem hipocrisia</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#1E3A2F] mb-2 sm:mb-3">
            {greeting}! <span className="animate-float inline-block">👋</span>
          </h1>
          <p className="text-sm sm:text-lg text-[#6B6B6B] max-w-md mx-auto px-4">
            A IA que fala a verdade. Como posso te ajudar?
          </p>
        </div>

        {/* Quick Tools */}
        <div className="mb-8 sm:mb-10 animate-fadeIn" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xs sm:text-sm font-semibold text-[#1E3A2F]">Acesso Rápido</h2>
            <button
              onClick={() => setActiveTab('bots')}
              className="text-[11px] sm:text-xs font-medium text-[#4A7C59] hover:underline flex items-center gap-1"
            >
              Ver todas
              <FiArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {quickTools.map((tool, i) => (
              <button
                key={tool.id}
                onClick={() => handleSelectTool(tool.id)}
                className="group relative flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white border border-[rgba(30,58,47,0.08)] rounded-xl sm:rounded-2xl hover:shadow-lg active:scale-[0.98] sm:hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, ${tool.color}08 0%, transparent 60%)`,
                  }}
                />
                <div
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${tool.color}15` }}
                >
                  {tool.icon}
                </div>
                <div className="text-left relative z-10 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-[#1E3A2F] group-hover:text-[#4A7C59] transition-colors truncate">
                    {tool.name}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[#8B8B8B] truncate">{tool.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Bots */}
        {featuredBots.length > 0 && (
          <div className="mb-8 sm:mb-10 animate-fadeIn" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <FiStar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C9A227]" />
              <h2 className="text-xs sm:text-sm font-semibold text-[#1E3A2F]">Novidades</h2>
            </div>
            <div className="grid gap-2 sm:gap-3">
              {featuredBots.map((bot, i) => (
                <button
                  key={bot.id}
                  onClick={() => handleSelectTool(bot.id)}
                  className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-white to-[#F5F5F0] border border-[rgba(30,58,47,0.08)] rounded-xl sm:rounded-2xl hover:shadow-lg active:scale-[0.99] hover:border-[#4A7C5940] transition-all duration-300"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 shadow-md"
                    style={{ backgroundColor: `${bot.color}15` }}
                  >
                    {bot.icon}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs sm:text-sm font-semibold text-[#1E3A2F] group-hover:text-[#4A7C59] transition-colors truncate">
                        {bot.name}
                      </p>
                      <span className="badge-new text-[9px] sm:text-[10px]">NEW</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#6B6B6B] line-clamp-1">{bot.description}</p>
                  </div>
                  <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B8B8B] group-hover:text-[#4A7C59] group-hover:translate-x-1 transition-all flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions - Hidden on very small screens */}
        <div className="animate-fadeIn hidden sm:block" style={{ animationDelay: '300ms' }}>
          <h2 className="text-sm font-semibold text-[#1E3A2F] mb-4">Sugestões para começar</h2>
          <div className="grid gap-2">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                className="group flex items-center gap-3 px-4 py-3 bg-white/60 hover:bg-white border border-[rgba(30,58,47,0.05)] hover:border-[rgba(30,58,47,0.1)] rounded-xl text-left transition-all"
              >
                <span className="text-[#8B8B8B] group-hover:text-[#4A7C59] transition-colors">💡</span>
                <span className="text-sm text-[#6B6B6B] group-hover:text-[#1E3A2F] transition-colors">
                  {suggestion}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile: Simple suggestion chips */}
        <div className="sm:hidden animate-fadeIn" style={{ animationDelay: '300ms' }}>
          <h2 className="text-xs font-semibold text-[#1E3A2F] mb-3">Sugestões</h2>
          <div className="flex flex-wrap gap-2">
            {['E-mail profissional', 'Explicar conceito', 'Criar plano', 'Analisar texto'].map((suggestion, i) => (
              <button
                key={i}
                className="px-3 py-2 text-xs bg-white border border-[rgba(30,58,47,0.08)] rounded-full text-[#6B6B6B] active:bg-[#EEEEE8] transition-all"
              >
                💡 {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
