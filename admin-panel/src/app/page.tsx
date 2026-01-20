'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiUsers, FiMessageSquare, FiMessageCircle, FiSettings, FiKey, FiLogOut, FiShoppingCart } from 'react-icons/fi';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalMessages: number;
  totalConversations: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.isAdmin) {
      router.push('/login');
      return;
    }
    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || !session?.user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center text-white font-bold shadow-lg">
                S
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Sage IA Admin</h1>
                <p className="text-xs text-gray-500">Painel de Controle</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.user.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Usuários</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? '...' : stats?.totalUsers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeIn" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <FiMessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Mensagens</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? '...' : stats?.totalMessages || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeIn" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiMessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Conversas</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? '...' : stats?.totalConversations || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/users"
            className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all group"
          >
            <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Gerenciar Usuários</h3>
              <p className="text-sm text-gray-500">Ver e editar usuários</p>
            </div>
          </Link>

          <Link
            href="/purchases"
            className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all group"
          >
            <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
              <FiShoppingCart className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Compras Payt</h3>
              <p className="text-sm text-gray-500">Webhooks e vendas</p>
            </div>
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all group"
          >
            <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
              <FiKey className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">API Key</h3>
              <p className="text-sm text-gray-500">Configurar chave da API</p>
            </div>
          </Link>

          <a
            href="http://localhost:3000"
            target="_blank"
            className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all group"
          >
            <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
              <FiMessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Abrir Chat</h3>
              <p className="text-sm text-gray-500">Ir para o frontend</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
