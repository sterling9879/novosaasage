'use client';

import { useState } from 'react';
import { FiArrowRight, FiStar, FiZap, FiTrendingUp, FiMenu } from 'react-icons/fi';
import { useChatStore } from '@/store/chatStore';
import { BOTS, BOT_CATEGORIES, Bot } from '@/lib/bots';

function BotCard({ bot, onSelect, index }: { bot: Bot; onSelect: () => void; index: number }) {
  return (
    <button
      onClick={onSelect}
      className="group relative bg-white rounded-xl sm:rounded-2xl border border-[rgba(79,89,102,0.08)] p-3 sm:p-5 text-left transition-all duration-300 hover:shadow-xl hover:shadow-[rgba(104,65,234,0.08)] hover:border-[#6841ea40] active:scale-[0.99] sm:hover:-translate-y-1 card-glow animate-fadeInUp overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Gradient Overlay on Hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${bot.color}05 0%, transparent 50%)`,
        }}
      />

      <div className="relative flex items-start gap-3 sm:gap-4">
        {/* Icon */}
        <div
          className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
          style={{
            backgroundColor: `${bot.color}15`,
            boxShadow: `0 0 0 0 ${bot.color}30`,
          }}
        >
          {bot.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
            <h3 className="font-semibold text-[rgb(38,38,38)] group-hover:text-[#6841ea] transition-colors truncate text-sm sm:text-base">
              {bot.name}
            </h3>
            {bot.isNew && (
              <span className="badge-new flex items-center gap-1 text-[9px] sm:text-[10px]">
                <FiZap className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                NEW
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[rgb(134,134,146)] line-clamp-2 leading-relaxed mb-2 sm:mb-3">
            {bot.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
              style={{
                backgroundColor: `${bot.color}10`,
                color: bot.color,
              }}
            >
              {BOT_CATEGORIES.find((c) => c.id === bot.category)?.name}
            </span>
            <div className="flex items-center gap-1 text-[rgb(170,170,180)] group-hover:text-[#6841ea] transition-colors">
              <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                Iniciar
              </span>
              <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function CategoryButton({
  category,
  isSelected,
  onClick,
  count,
}: {
  category: { id: string; name: string; icon: string } | null;
  isSelected: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
        isSelected
          ? 'bg-gradient-to-r from-[#6841ea] to-[#8b5cf6] text-white shadow-lg shadow-[#6841ea25]'
          : 'bg-white text-[rgb(38,38,38)] hover:bg-[rgba(104,65,234,0.05)] active:bg-[rgba(104,65,234,0.1)] hover:text-[#6841ea] border border-[rgba(79,89,102,0.08)]'
      }`}
    >
      {category ? (
        <>
          <span className="text-sm sm:text-base">{category.icon}</span>
          <span>{category.name}</span>
        </>
      ) : (
        <>
          <FiStar className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? '' : 'text-[rgb(170,170,180)] group-hover:text-[#6841ea]'}`} />
          <span>Todos</span>
        </>
      )}
      <span
        className={`px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs ${
          isSelected ? 'bg-white/20' : 'bg-[rgb(245,245,250)] text-[rgb(134,134,146)]'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

export default function BotsGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { setSelectedBotId, reset, setActiveTab, toggleSidebar } = useChatStore();

  const filteredBots = selectedCategory
    ? BOTS.filter((bot) => bot.category === selectedCategory)
    : BOTS;

  const handleSelectBot = (bot: Bot) => {
    reset();
    setSelectedBotId(bot.id);
    setActiveTab('chat');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-[rgb(249,250,251)] to-white overflow-hidden">
      {/* Header */}
      <header className="px-4 sm:px-6 py-3 sm:py-5 bg-white/80 backdrop-blur-lg border-b border-[rgba(79,89,102,0.08)]">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 -ml-1 text-[rgb(134,134,146)] hover:text-[rgb(38,38,38)] hover:bg-[rgb(245,245,245)] rounded-xl transition-all"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#6841ea] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[#6841ea20] flex-shrink-0">
            <FiZap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-[rgb(38,38,38)]">Ferramentas</h1>
            <p className="text-xs sm:text-sm text-[rgb(134,134,146)]">
              {BOTS.length} assistentes
            </p>
          </div>
        </div>
      </header>

      {/* Categories - Horizontal scroll on mobile */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white/50 backdrop-blur-sm border-b border-[rgba(79,89,102,0.05)] sticky top-0 z-10">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
          <CategoryButton
            category={null}
            isSelected={selectedCategory === null}
            onClick={() => setSelectedCategory(null)}
            count={BOTS.length}
          />
          {BOT_CATEGORIES.map((category) => (
            <CategoryButton
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id}
              onClick={() => setSelectedCategory(category.id)}
              count={BOTS.filter((b) => b.category === category.id).length}
            />
          ))}
        </div>
      </div>

      {/* Trending Section */}
      {selectedCategory === null && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#6841ea08] to-transparent">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#6841ea]">
            <FiTrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Mais Populares</span>
          </div>
        </div>
      )}

      {/* Bots Grid */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredBots.map((bot, index) => (
            <BotCard
              key={bot.id}
              bot={bot}
              onSelect={() => handleSelectBot(bot)}
              index={index}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredBots.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[rgb(245,245,250)] flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-2xl sm:text-3xl">🔍</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-[rgb(38,38,38)] mb-2">
              Nenhuma ferramenta encontrada
            </h3>
            <p className="text-xs sm:text-sm text-[rgb(134,134,146)]">
              Tente outra categoria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
