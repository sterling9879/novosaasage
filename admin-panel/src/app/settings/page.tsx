'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiKey, FiArrowLeft, FiCheck, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [currentApiKey, setCurrentApiKey] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.isAdmin) {
      router.push('/login');
      return;
    }
    fetchSettings();
  }, [session, status, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setCurrentApiKey(data.apiKey);
        setHasApiKey(data.hasApiKey);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSaving(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'API Key salva com sucesso!' });
        setApiKey('');
        fetchSettings();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar API Key' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao salvar API Key' });
    } finally {
      setIsSaving(false);
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
          <div className="flex items-center h-16 gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <FiKey className="w-5 h-5 text-purple-600" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Configurações da API</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">API Key WaveSpeed</h2>

            {/* Status */}
            {hasApiKey ? (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">API Key Configurada</p>
                  <p className="text-sm text-green-600 font-mono mt-1">{currentApiKey}</p>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Nenhuma API Key Configurada</p>
                  <p className="text-sm text-yellow-600">O chat não funcionará sem ela.</p>
                </div>
              </div>
            )}

            {/* Message */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
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

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {hasApiKey ? 'Nova API Key (deixe vazio para manter)' : 'API Key'}
                </label>
                <input
                  type="password"
                  placeholder="Sua API Key do WaveSpeed"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-600/20"
              >
                {isSaving ? 'Salvando...' : 'Salvar API Key'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Para obter sua API Key, acesse{' '}
                <a
                  href="https://wavespeed.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  wavespeed.ai
                </a>{' '}
                e crie uma conta.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
