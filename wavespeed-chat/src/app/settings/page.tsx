'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiUser,
  FiMail,
  FiLock,
  FiArrowLeft,
  FiCheck,
  FiAlertCircle,
  FiMessageSquare,
  FiCreditCard,
  FiShield,
} from 'react-icons/fi';

export default function UserSettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // User stats
  const [stats, setStats] = useState<{ messagesUsed: number; messagesLimit: number } | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    setName(session.user.name || '');
    setEmail(session.user.email || '');
    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        update({ name });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar perfil' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Erro ao alterar senha' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao alterar senha' });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(249,250,251)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6841ea]"></div>
      </div>
    );
  }

  const usagePercentage = stats ? (stats.messagesUsed / stats.messagesLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-[rgb(249,250,251)]">
      {/* Header */}
      <header className="bg-white border-b border-[rgba(79,89,102,0.08)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-[rgb(134,134,146)] hover:text-[rgb(38,38,38)] transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Voltar</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[rgb(38,38,38)]">Configurações da Conta</h1>
          <p className="text-[rgb(134,134,146)] mt-1">Gerencie suas informações pessoais</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[rgba(79,89,102,0.08)] pb-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-[#6841ea] text-white shadow-md'
                : 'text-[rgb(134,134,146)] hover:bg-[rgb(245,245,245)]'
            }`}
          >
            <FiUser className="w-4 h-4" />
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'security'
                ? 'bg-[#6841ea] text-white shadow-md'
                : 'text-[rgb(134,134,146)] hover:bg-[rgb(245,245,245)]'
            }`}
          >
            <FiShield className="w-4 h-4" />
            Segurança
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'plan'
                ? 'bg-[#6841ea] text-white shadow-md'
                : 'text-[rgb(134,134,146)] hover:bg-[rgb(245,245,245)]'
            }`}
          >
            <FiCreditCard className="w-4 h-4" />
            Plano
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-start gap-3 animate-fadeIn ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-[rgba(79,89,102,0.08)] p-6 shadow-sm animate-fadeIn">
            <h2 className="text-lg font-semibold text-[rgb(38,38,38)] mb-6">Informações do Perfil</h2>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[rgb(38,38,38)] mb-2">
                  Nome
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(170,170,180)]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[rgb(249,250,251)] border border-[rgba(79,89,102,0.08)] rounded-xl text-[rgb(38,38,38)] focus:outline-none focus:border-[#6841ea] focus:ring-2 focus:ring-[#6841ea20] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(38,38,38)] mb-2">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(170,170,180)]" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-[rgb(245,245,250)] border border-[rgba(79,89,102,0.08)] rounded-xl text-[rgb(134,134,146)] cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-[rgb(170,170,180)] mt-1">O email não pode ser alterado</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-[#6841ea] to-[#8b5cf6] text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-[#6841ea20]"
              >
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl border border-[rgba(79,89,102,0.08)] p-6 shadow-sm animate-fadeIn">
            <h2 className="text-lg font-semibold text-[rgb(38,38,38)] mb-6">Alterar Senha</h2>

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[rgb(38,38,38)] mb-2">
                  Senha Atual
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(170,170,180)]" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    className="w-full pl-10 pr-4 py-3 bg-[rgb(249,250,251)] border border-[rgba(79,89,102,0.08)] rounded-xl text-[rgb(38,38,38)] placeholder-[rgb(170,170,180)] focus:outline-none focus:border-[#6841ea] focus:ring-2 focus:ring-[#6841ea20] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(38,38,38)] mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(170,170,180)]" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-4 py-3 bg-[rgb(249,250,251)] border border-[rgba(79,89,102,0.08)] rounded-xl text-[rgb(38,38,38)] placeholder-[rgb(170,170,180)] focus:outline-none focus:border-[#6841ea] focus:ring-2 focus:ring-[#6841ea20] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(38,38,38)] mb-2">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(170,170,180)]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full pl-10 pr-4 py-3 bg-[rgb(249,250,251)] border border-[rgba(79,89,102,0.08)] rounded-xl text-[rgb(38,38,38)] placeholder-[rgb(170,170,180)] focus:outline-none focus:border-[#6841ea] focus:ring-2 focus:ring-[#6841ea20] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-[#6841ea] to-[#8b5cf6] text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-[#6841ea20]"
              >
                {isLoading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </form>
          </div>
        )}

        {/* Plan Tab */}
        {activeTab === 'plan' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Current Plan */}
            <div className="bg-white rounded-2xl border border-[rgba(79,89,102,0.08)] p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[rgb(38,38,38)] mb-6">Seu Plano</h2>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#6841ea10] to-[#8b5cf610] rounded-xl mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6841ea] to-[#8b5cf6] flex items-center justify-center">
                    <FiCreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[rgb(38,38,38)]">Plano Gratuito</h3>
                    <p className="text-sm text-[rgb(134,134,146)]">Acesso básico ao Sage IA</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-[#6841ea] text-white text-xs font-semibold rounded-full">
                  Atual
                </span>
              </div>

              {/* Usage */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[rgb(134,134,146)]">Mensagens Utilizadas</span>
                  <span className="font-medium text-[rgb(38,38,38)]">
                    {stats?.messagesUsed || 0} / {stats?.messagesLimit || 100}
                  </span>
                </div>
                <div className="w-full h-3 bg-[rgb(245,245,250)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 50 ? 'bg-orange-500' : 'bg-[#6841ea]'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-[rgb(170,170,180)]">
                  O limite é renovado mensalmente
                </p>
              </div>
            </div>

            {/* Upgrade */}
            <div className="bg-gradient-to-br from-[#6841ea] to-[#8b5cf6] rounded-2xl p-6 text-white shadow-lg shadow-[#6841ea30]">
              <h3 className="text-xl font-bold mb-2">Upgrade para Pro</h3>
              <p className="text-white/80 mb-4">
                Mensagens ilimitadas, modelos avançados e muito mais.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <FiCheck className="w-4 h-4" />
                  Mensagens ilimitadas
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <FiCheck className="w-4 h-4" />
                  Acesso a todos os modelos
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <FiCheck className="w-4 h-4" />
                  Prioridade no suporte
                </li>
              </ul>
              <button className="w-full py-3 bg-white text-[#6841ea] font-semibold rounded-xl hover:bg-white/90 transition-all">
                Em breve
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
