'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FiUsers,
  FiArrowLeft,
  FiTrash2,
  FiEdit2,
  FiShield,
  FiUser,
  FiPlus,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiDownload,
} from 'react-icons/fi';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  messagesUsed: number;
  messagesLimit: number;
  createdAt: string;
  _count?: {
    conversations: number;
    messages: number;
  };
}

interface UserFormData {
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
  messagesLimit: number;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    name: '',
    isAdmin: false,
    messagesLimit: 50,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.isAdmin) {
      router.push('/login');
      return;
    }
    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      name: '',
      isAdmin: false,
      messagesLimit: 50,
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      name: user.name || '',
      isAdmin: user.isAdmin,
      messagesLimit: user.messagesLimit,
    });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const url = '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';
      const body = editingUser
        ? { id: editingUser.id, ...formData, password: formData.password || undefined }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar usuário');
      }

      setSuccess(editingUser ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      closeModal();
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar usuário');
      }

      setSuccess('Usuário deletado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar usuário');
      setTimeout(() => setError(''), 3000);
    }
  };

  const resetUserMessages = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, messagesUsed: 0 }),
      });

      if (response.ok) {
        setSuccess('Contador de mensagens resetado!');
        setTimeout(() => setSuccess(''), 3000);
        fetchUsers();
      }
    } catch (err) {
      console.error('Error resetting messages:', err);
    }
  };

  const exportUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `usuarios_sage_ia_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccess('Backup exportado com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Erro ao exportar');
      }
    } catch (err) {
      setError('Erro ao exportar usuários');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (status === 'loading' || !session?.user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(17,24,39)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(17,24,39)]">
      {/* Header */}
      <header className="bg-[rgb(31,41,55)] border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <FiUsers className="w-5 h-5 text-purple-400" />
                </div>
                <h1 className="text-lg font-bold text-white">Gerenciar Usuários</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportUsers}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-xl font-medium transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Novo Usuário
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Alerts */}
      {(error || success) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
              <FiCheck className="w-5 h-5 flex-shrink-0" />
              {success}
            </div>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <FiUsers className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Nenhum usuário encontrado</h3>
            <p className="text-gray-500 mb-4">Comece criando um novo usuário.</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Criar Usuário
            </button>
          </div>
        ) : (
          <div className="bg-[rgb(31,41,55)] shadow-xl rounded-2xl border border-gray-700 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-[rgb(17,24,39)]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Mensagens
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Conversas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Cadastro
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            user.isAdmin ? 'bg-purple-500/20' : 'bg-gray-600'
                          }`}
                        >
                          {user.isAdmin ? (
                            <FiShield className="w-5 h-5 text-purple-400" />
                          ) : (
                            <FiUser className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.name || 'Sem nome'}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          user.isAdmin
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-gray-600 text-gray-300'
                        }`}
                      >
                        {user.isAdmin ? 'Admin' : 'Usuário'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              user.messagesUsed / user.messagesLimit > 0.8
                                ? 'bg-red-500'
                                : 'bg-purple-500'
                            }`}
                            style={{
                              width: `${Math.min((user.messagesUsed / user.messagesLimit) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-300">
                          {user.messagesUsed} / {user.messagesLimit}
                        </span>
                        {user.messagesUsed > 0 && (
                          <button
                            onClick={() => resetUserMessages(user.id)}
                            className="text-xs text-purple-400 hover:text-purple-300"
                            title="Resetar contador"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user._count?.conversations || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {deleteConfirm === user.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-gray-400">Confirmar?</span>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="p-2 text-gray-400 hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            disabled={user.id === session.user.id}
                            title={user.id === session.user.id ? 'Não pode deletar você mesmo' : ''}
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[rgb(31,41,55)] rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[rgb(17,24,39)] border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Nome do usuário"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[rgb(17,24,39)] border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha {editingUser ? '(deixe vazio para manter)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-[rgb(17,24,39)] border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="••••••••"
                  required={!editingUser}
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Limite de Mensagens
                </label>
                <input
                  type="number"
                  value={formData.messagesLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, messagesLimit: parseInt(e.target.value) || 50 })
                  }
                  className="w-full px-4 py-3 bg-[rgb(17,24,39)] border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  min={1}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={formData.isAdmin}
                  onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-600 bg-[rgb(17,24,39)] text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                />
                <label htmlFor="isAdmin" className="text-sm text-gray-300">
                  Administrador (acesso ao painel admin)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-xl font-medium transition-colors"
                >
                  {isSubmitting ? 'Salvando...' : editingUser ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
