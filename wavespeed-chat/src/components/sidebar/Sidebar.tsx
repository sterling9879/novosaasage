'use client';

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiPlus,
  FiLogOut,
  FiSettings,
  FiMenu,
  FiSearch,
  FiMessageSquare,
  FiGrid,
  FiX,
  FiChevronDown,
  FiMoon,
  FiSun,
  FiHelpCircle,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi';
import { useChatStore } from '@/store/chatStore';
import ConversationList from './ConversationList';
import { MODELS, getProviderLogo } from '@/lib/models';

interface SidebarProps {
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export default function Sidebar({
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
}: SidebarProps) {
  const { data: session } = useSession();
  const {
    isSidebarOpen,
    toggleSidebar,
    isSidebarCollapsed,
    toggleSidebarCollapsed,
    activeTab,
    setActiveTab,
    selectedModel,
    setSelectedModel,
    setSelectedBotId,
  } = useChatStore();
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const selectedModelData = MODELS.find((m) => m.id === selectedModel) || MODELS[0];

  const handleNewChat = () => {
    setSelectedBotId(null);
    onNewConversation();
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Collapsed sidebar (mini version)
  if (isSidebarCollapsed) {
    return (
      <>
        {/* Collapsed Sidebar - Desktop only */}
        <aside className="hidden lg:flex fixed lg:static inset-y-0 left-0 z-40 w-[72px] bg-white border-r border-[rgba(30,58,47,0.08)] flex-col items-center py-4 transition-all duration-300">
          {/* Logo */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4A7C59] to-[#1E3A2F] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#4A7C5925] mb-4">
            S
          </div>

          {/* Expand button */}
          <button
            onClick={toggleSidebarCollapsed}
            className="p-2.5 text-[#6B6B6B] hover:text-[#4A7C59] hover:bg-[#EEEEE8] rounded-xl transition-all mb-4"
            title="Expandir sidebar"
          >
            <FiChevronsRight className="w-5 h-5" />
          </button>

          {/* New Chat */}
          <button
            onClick={handleNewChat}
            className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#4A7C59] to-[#1E3A2F] text-white flex items-center justify-center shadow-lg shadow-[#4A7C5925] hover:shadow-xl hover:scale-105 transition-all mb-4"
            title="Nova Conversa"
          >
            <FiPlus className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className="w-8 h-px bg-[rgba(30,58,47,0.08)] my-2" />

          {/* Tabs */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'chat'
                  ? 'bg-[#4A7C59] text-white shadow-md'
                  : 'text-[#6B6B6B] hover:bg-[#EEEEE8] hover:text-[#1E3A2F]'
              }`}
              title="Chat"
            >
              <FiMessageSquare className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('bots')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'bots'
                  ? 'bg-[#4A7C59] text-white shadow-md'
                  : 'text-[#6B6B6B] hover:bg-[#EEEEE8] hover:text-[#1E3A2F]'
              }`}
              title="Ferramentas"
            >
              <FiGrid className="w-5 h-5" />
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={toggleDarkMode}
              className="w-11 h-11 rounded-xl text-[#6B6B6B] hover:bg-[#EEEEE8] hover:text-[#1E3A2F] flex items-center justify-center transition-all"
              title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
            >
              {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
            <Link
              href="/settings"
              className="w-11 h-11 rounded-xl text-[#6B6B6B] hover:bg-[#EEEEE8] hover:text-[#1E3A2F] flex items-center justify-center transition-all"
              title="Configurações"
            >
              <FiSettings className="w-5 h-5" />
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-11 h-11 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all"
              title="Sair"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>

          {/* User Avatar */}
          <div className="mt-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A7C59] to-[#1E3A2F] flex items-center justify-center text-white font-bold shadow-md">
              {session?.user?.name?.[0] || session?.user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </aside>
      </>
    );
  }

  // Full sidebar
  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 animate-fadeIn"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-[280px] sm:w-[300px] bg-white border-r border-[rgba(30,58,47,0.08)] flex flex-col
          transform transition-all duration-300 ease-out shadow-xl lg:shadow-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header with User */}
        <div className="p-4 border-b border-[rgba(30,58,47,0.08)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4A7C59] to-[#1E3A2F] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#4A7C5925] transition-transform group-hover:scale-105">
                {session?.user?.name?.[0] || session?.user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1E3A2F] truncate">
                {session?.user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-[#6B6B6B] truncate">{session?.user?.email}</p>
            </div>
            {/* Collapse button (desktop) */}
            <button
              onClick={toggleSidebarCollapsed}
              className="hidden lg:flex p-2 hover:bg-[#EEEEE8] rounded-xl transition-colors text-[#6B6B6B] hover:text-[#1E3A2F]"
              title="Minimizar sidebar"
            >
              <FiChevronsLeft className="w-5 h-5" />
            </button>
            {/* Close button (mobile) */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-[#EEEEE8] rounded-xl transition-colors"
            >
              <FiX className="w-5 h-5 text-[#6B6B6B]" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3 group">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8B8B] group-focus-within:text-[#4A7C59] transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar conversas..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F0] border border-transparent rounded-xl text-sm text-[#1E3A2F] placeholder-[#8B8B8B] focus:outline-none focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C5915] transition-all"
            />
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#4A7C59] to-[#1E3A2F] text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-lg shadow-[#4A7C5925] hover:shadow-xl hover:shadow-[#4A7C5930] active:scale-[0.98]"
          >
            <FiPlus className="w-5 h-5" />
            <span>Nova Conversa</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-1 border-b border-[rgba(30,58,47,0.08)]">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-[#4A7C59] text-white shadow-md shadow-[#4A7C5920]'
                : 'text-[#6B6B6B] hover:bg-[#EEEEE8] hover:text-[#1E3A2F]'
            }`}
          >
            <FiMessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('bots')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
              activeTab === 'bots'
                ? 'bg-[#4A7C59] text-white shadow-md shadow-[#4A7C5920]'
                : 'text-[#6B6B6B] hover:bg-[#EEEEE8] hover:text-[#1E3A2F]'
            }`}
          >
            <FiGrid className="w-4 h-4" />
            Ferramentas
          </button>
        </div>

        {/* Model Selector */}
        <div className="p-3 border-b border-[rgba(30,58,47,0.08)]">
          <p className="text-[10px] font-semibold text-[#8B8B8B] uppercase tracking-wider mb-2 px-1">
            Modelo
          </p>
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="w-full flex items-center gap-3 p-2.5 bg-[#F5F5F0] hover:bg-[#EEEEE8] rounded-xl transition-all group"
            >
              <Image
                src={getProviderLogo(selectedModelData.provider)}
                alt={selectedModelData.provider}
                width={24}
                height={24}
                className="rounded-lg"
              />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-[#1E3A2F]">{selectedModelData.name}</p>
                <p className="text-[10px] text-[#8B8B8B]">{selectedModelData.provider}</p>
              </div>
              <FiChevronDown
                className={`w-4 h-4 text-[#6B6B6B] transition-transform ${
                  showModelDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown */}
            {showModelDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[rgba(30,58,47,0.08)] rounded-xl shadow-xl z-50 py-1 animate-scaleIn overflow-hidden max-h-[300px] overflow-y-auto">
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
                      selectedModel === model.id
                        ? 'bg-[#4A7C5910] text-[#4A7C59]'
                        : 'hover:bg-[#F5F5F0] text-[#1E3A2F]'
                    }`}
                  >
                    <Image
                      src={getProviderLogo(model.provider)}
                      alt={model.provider}
                      width={22}
                      height={22}
                      className="rounded-lg"
                    />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{model.name}</p>
                      <p className="text-[10px] text-[#8B8B8B]">{model.provider}</p>
                    </div>
                    {selectedModel === model.id && (
                      <div className="w-2 h-2 bg-[#4A7C59] rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <p className="text-[10px] font-semibold text-[#8B8B8B] uppercase tracking-wider px-4 pt-3 pb-2">
            Conversas Recentes
          </p>
          <ConversationList
            onSelectConversation={onSelectConversation}
            onDeleteConversation={onDeleteConversation}
            searchQuery={searchQuery}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-[rgba(30,58,47,0.08)] p-3">
          <div className="flex items-center gap-1 mb-2">
            <button
              onClick={toggleDarkMode}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-[#6B6B6B] hover:bg-[#EEEEE8] hover:text-[#1E3A2F] rounded-xl transition-all"
              title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
            >
              {isDarkMode ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-[#6B6B6B] hover:bg-[#EEEEE8] hover:text-[#1E3A2F] rounded-xl transition-all"
              title="Ajuda"
            >
              <FiHelpCircle className="w-4 h-4" />
            </button>
            <Link
              href="/settings"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-[#6B6B6B] hover:bg-[#EEEEE8] hover:text-[#1E3A2F] rounded-xl transition-all"
              title="Configurações"
            >
              <FiSettings className="w-4 h-4" />
            </Link>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>
    </>
  );
}
