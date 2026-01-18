'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { FiPlus, FiLogOut, FiSettings, FiMenu } from 'react-icons/fi';
import { useChatStore } from '@/store/chatStore';
import ConversationList from './ConversationList';
import Button from '@/components/ui/Button';

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
  const { isSidebarOpen, toggleSidebar } = useChatStore();

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
          w-64 bg-gray-50 border-r border-gray-200 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4 border-b border-gray-200">
          <Button onClick={onNewConversation} className="w-full" variant="primary">
            <FiPlus className="w-4 h-4 mr-2" />
            Nova Conversa
          </Button>
        </div>

        <ConversationList
          onSelectConversation={onSelectConversation}
          onDeleteConversation={onDeleteConversation}
        />

        <div className="mt-auto border-t border-gray-200 p-4 space-y-2">
          {session?.user?.isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiSettings className="w-4 h-4" />
              Painel Admin
            </Link>
          )}

          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || session?.user?.email}
              </p>
              <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sair"
            >
              <FiLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
