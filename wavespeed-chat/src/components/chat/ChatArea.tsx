'use client';

import { useState, useEffect } from 'react';
import { FiArrowRight, FiZap, FiStar, FiCpu } from 'react-icons/fi';
import { useChatStore } from '@/store/chatStore';
import ModelSelector from './ModelSelector';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import BotsGrid from './BotsGrid';
import { getBotById, BOTS } from '@/lib/bots';

interface ChatAreaProps {
  onSendMessage: (message: string) => void;
}

export default function ChatArea({ onSendMessage }: ChatAreaProps) {
  const { currentConversationId, activeTab, selectedBotId, messages, setSelectedBotId } = useChatStore();

  const selectedBot = selectedBotId ? getBotById(selectedBotId) : null;

  // Se estiver na aba de bots e não tiver bot selecionado, mostrar grid
  if (activeTab === 'bots' && !selectedBotId) {
    return <BotsGrid />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-[rgb(249,250,251)] to-white">
      {/* Header */}
      <header className="border-b border-[rgba(79,89,102,0.08)] px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-lg sticky top-0 z-10">
        <div className="flex items-center gap-4">
          {selectedBot ? (
            <>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-transform hover:scale-105"
                style={{
                  backgroundColor: `${selectedBot.color}15`,
                  boxShadow: `0 4px 12px ${selectedBot.color}20`,
                }}
              >
                {selectedBot.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-[rgb(38,38,38)]">{selectedBot.name}</h1>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-green-100 text-green-600 rounded-full">
                    Online
                  </span>
                </div>
                <p className="text-sm text-[rgb(134,134,146)] line-clamp-1">{selectedBot.description}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6841ea] to-[#8b5cf6] flex items-center justify-center shadow-lg">
                <FiCpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[rgb(38,38,38)]">
                  {currentConversationId ? 'Conversa' : 'Assistente IA'}
                </h1>
                <p className="text-xs text-[rgb(134,134,146)]">Pronto para ajudar</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {selectedBot && (
            <button
              onClick={() => setSelectedBotId(null)}
              className="px-3 py-1.5 text-xs font-medium text-[rgb(134,134,146)] hover:text-[rgb(38,38,38)] hover:bg-[rgb(245,245,245)] rounded-lg transition-all"
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
    </div>
  );
}

function WelcomeScreen() {
  const { setSelectedBotId, setActiveTab } = useChatStore();
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
    { id: 'translator', icon: '🌐', name: 'Traduzir', color: '#3b82f6', desc: 'Traduza textos' },
    { id: 'summarizer', icon: '📋', name: 'Resumir', color: '#10b981', desc: 'Resuma conteúdos' },
    { id: 'writer', icon: '✍️', name: 'Escrever', color: '#8b5cf6', desc: 'Crie textos' },
    { id: 'grammar', icon: '📝', name: 'Gramática', color: '#f59e0b', desc: 'Corrija erros' },
    { id: 'email', icon: '📧', name: 'E-mail', color: '#ec4899', desc: 'Escreva e-mails' },
    { id: 'code-helper', icon: '💻', name: 'Código', color: '#06b6d4', desc: 'Ajuda com código' },
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
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#6841ea10] text-[#6841ea] rounded-full text-sm font-medium mb-6">
            <FiZap className="w-4 h-4" />
            <span>Powered by WaveSpeed AI</span>
          </div>
          <h1 className="text-4xl font-bold text-[rgb(38,38,38)] mb-3">
            {greeting}! <span className="animate-float inline-block">👋</span>
          </h1>
          <p className="text-lg text-[rgb(134,134,146)] max-w-md mx-auto">
            Sou seu assistente inteligente. Como posso te ajudar hoje?
          </p>
        </div>

        {/* Quick Tools */}
        <div className="mb-10 animate-fadeIn" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[rgb(38,38,38)]">Acesso Rápido</h2>
            <button
              onClick={() => setActiveTab('bots')}
              className="text-xs font-medium text-[#6841ea] hover:underline flex items-center gap-1"
            >
              Ver todas
              <FiArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickTools.map((tool, i) => (
              <button
                key={tool.id}
                onClick={() => handleSelectTool(tool.id)}
                className="group relative flex items-center gap-3 p-4 bg-white border border-[rgba(79,89,102,0.08)] rounded-2xl hover:shadow-lg hover:border-transparent hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, ${tool.color}08 0%, transparent 60%)`,
                  }}
                />
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${tool.color}15` }}
                >
                  {tool.icon}
                </div>
                <div className="text-left relative z-10">
                  <p className="text-sm font-semibold text-[rgb(38,38,38)] group-hover:text-[#6841ea] transition-colors">
                    {tool.name}
                  </p>
                  <p className="text-[11px] text-[rgb(170,170,180)]">{tool.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Bots */}
        {featuredBots.length > 0 && (
          <div className="mb-10 animate-fadeIn" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <FiStar className="w-4 h-4 text-[#f59e0b]" />
              <h2 className="text-sm font-semibold text-[rgb(38,38,38)]">Novidades</h2>
            </div>
            <div className="grid gap-3">
              {featuredBots.map((bot, i) => (
                <button
                  key={bot.id}
                  onClick={() => handleSelectTool(bot.id)}
                  className="group flex items-center gap-4 p-4 bg-gradient-to-r from-white to-[rgb(252,252,253)] border border-[rgba(79,89,102,0.08)] rounded-2xl hover:shadow-lg hover:border-[#6841ea40] transition-all duration-300"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md"
                    style={{ backgroundColor: `${bot.color}15` }}
                  >
                    {bot.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-[rgb(38,38,38)] group-hover:text-[#6841ea] transition-colors">
                        {bot.name}
                      </p>
                      <span className="badge-new">NEW</span>
                    </div>
                    <p className="text-xs text-[rgb(134,134,146)] line-clamp-1">{bot.description}</p>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-[rgb(170,170,180)] group-hover:text-[#6841ea] group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        <div className="animate-fadeIn" style={{ animationDelay: '300ms' }}>
          <h2 className="text-sm font-semibold text-[rgb(38,38,38)] mb-4">Sugestões para começar</h2>
          <div className="grid gap-2">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                className="group flex items-center gap-3 px-4 py-3 bg-white/60 hover:bg-white border border-[rgba(79,89,102,0.05)] hover:border-[rgba(79,89,102,0.1)] rounded-xl text-left transition-all"
              >
                <span className="text-[rgb(170,170,180)] group-hover:text-[#6841ea] transition-colors">💡</span>
                <span className="text-sm text-[rgb(100,100,110)] group-hover:text-[rgb(38,38,38)] transition-colors">
                  {suggestion}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
