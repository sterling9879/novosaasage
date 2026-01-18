'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlus, FiLogOut, FiSettings, FiMenu, FiSearch, FiMessageSquare, FiGrid, FiX } from 'react-icons/fi';
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
  const { isSidebarOpen, toggleSidebar, activeTab, setActiveTab, selectedModel, setSelectedModel, setSelectedBotId } = useChatStore();

  const handleNewChat = () => {
    setSelectedBotId(null);
    onNewConversation();
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        <FiMenu className="w-5 h-5" />
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-[300px] bg-white border-r border-[rgba(79,89,102,0.08)] flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header with User */}
        <div className="p-4 border-b border-[rgba(79,89,102,0.08)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#6841ea] flex items-center justify-center text-white font-semibold">
              {session?.user?.name?.[0] || session?.user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[rgb(38,38,38)] truncate">
                {session?.user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-[rgb(134,134,146)] truncate">{session?.user?.email}</p>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1.5 hover:bg-[rgb(245,245,245)] rounded-lg"
            >
              <FiX className="w-5 h-5 text-[rgb(134,134,146)]" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(134,134,146)]" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              className="w-full pl-9 pr-3 py-2 bg-[rgb(249,250,251)] border-0 rounded-lg text-sm placeholder-[rgb(134,134,146)] focus:outline-none focus:ring-2 focus:ring-[#6841ea]"
            />
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[rgba(79,89,102,0.08)] rounded-lg hover:bg-[rgb(245,245,245)] transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span className="text-sm font-medium">Nova Conversa</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[rgba(79,89,102,0.08)]">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'text-[#6841ea] border-b-2 border-[#6841ea]'
                : 'text-[rgb(134,134,146)] hover:text-[rgb(38,38,38)]'
            }`}
          >
            <FiMessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('bots')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === 'bots'
                ? 'text-[#6841ea] border-b-2 border-[#6841ea]'
                : 'text-[rgb(134,134,146)] hover:text-[rgb(38,38,38)]'
            }`}
          >
            <FiGrid className="w-4 h-4" />
            Ferramentas
            <span className="badge-new">NEW</span>
          </button>
        </div>

        {/* Models */}
        <div className="p-3 border-b border-[rgba(79,89,102,0.08)]">
          <p className="text-xs font-medium text-[rgb(134,134,146)] mb-2 px-1">MODELOS</p>
          <div className="space-y-1">
            {MODELS.slice(0, 5).map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedModel === model.id
                    ? 'bg-[#f5f3ff] text-[#6841ea]'
                    : 'hover:bg-[rgb(245,245,245)] text-[rgb(38,38,38)]'
                }`}
              >
                <Image
                  src={getProviderLogo(model.provider)}
                  alt={model.provider}
                  width={18}
                  height={18}
                  className="rounded"
                />
                <span className="truncate">{model.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <p className="text-xs font-medium text-[rgb(134,134,146)] px-4 pt-3 pb-2">RECENTES</p>
          <ConversationList
            onSelectConversation={onSelectConversation}
            onDeleteConversation={onDeleteConversation}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-[rgba(79,89,102,0.08)] p-3 space-y-1">
          {session?.user?.isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 text-sm text-[rgb(134,134,146)] hover:bg-[rgb(245,245,245)] hover:text-[rgb(38,38,38)] rounded-lg transition-colors"
            >
              <FiSettings className="w-4 h-4" />
              Painel Admin
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[rgb(134,134,146)] hover:bg-[rgb(245,245,245)] hover:text-[rgb(38,38,38)] rounded-lg transition-colors"
          >
            <FiLogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
