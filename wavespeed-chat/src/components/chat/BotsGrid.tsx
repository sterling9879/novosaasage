'use client';

import { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { BOTS, BOT_CATEGORIES, Bot } from '@/lib/bots';

export default function BotsGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { setSelectedBotId, reset } = useChatStore();

  const filteredBots = selectedCategory
    ? BOTS.filter((bot) => bot.category === selectedCategory)
    : BOTS;

  const handleSelectBot = (bot: Bot) => {
    reset();
    setSelectedBotId(bot.id);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[rgb(249,250,251)] overflow-hidden">
      {/* Header */}
      <header className="border-b border-[rgba(79,89,102,0.08)] px-6 py-4 bg-white">
        <h1 className="text-xl font-semibold text-[rgb(38,38,38)] mb-1">Ferramentas</h1>
        <p className="text-sm text-[rgb(134,134,146)]">
          Assistentes especializados para diferentes tarefas
        </p>
      </header>

      {/* Categories */}
      <div className="px-6 py-4 bg-white border-b border-[rgba(79,89,102,0.08)]">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-[#6841ea] text-white'
                : 'bg-[rgb(249,250,251)] text-[rgb(38,38,38)] hover:bg-[rgb(245,245,245)]'
            }`}
          >
            Todos
          </button>
          {BOT_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-[#6841ea] text-white'
                  : 'bg-[rgb(249,250,251)] text-[rgb(38,38,38)] hover:bg-[rgb(245,245,245)]'
              }`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bots Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBots.map((bot) => (
            <button
              key={bot.id}
              onClick={() => handleSelectBot(bot)}
              className="bg-white rounded-xl border border-[rgba(79,89,102,0.08)] p-4 text-left hover:shadow-md hover:border-[#6841ea] transition-all group"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: `${bot.color}15` }}
                >
                  {bot.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[rgb(38,38,38)] group-hover:text-[#6841ea] transition-colors truncate">
                      {bot.name}
                    </h3>
                    {bot.isNew && <span className="badge-new">NEW</span>}
                  </div>
                  <p className="text-sm text-[rgb(134,134,146)] line-clamp-2">
                    {bot.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
