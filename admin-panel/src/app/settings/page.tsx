'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiKey, FiArrowLeft, FiCheck, FiAlertCircle, FiMail, FiServer, FiSend } from 'react-icons/fi';
import Link from 'next/link';

interface SettingStatus {
  hasValue: boolean;
  value: string | null;
}

interface SettingsData {
  wavespeed_api_key: SettingStatus;
  brevo_api_key: SettingStatus;
  email_sender_name: SettingStatus;
  email_sender_address: SettingStatus;
  payt_integration_key: SettingStatus;
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Estados para WaveSpeed
  const [wavespeedKey, setWavespeedKey] = useState('');

  // Estados para Brevo
  const [brevoKey, setBrevoKey] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');

  // Estados para Payt
  const [paytKey, setPaytKey] = useState('');

  // Estados gerais
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; section: string } | null>(null);

  // Estado para teste de email
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

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
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSection = async (section: string, data: Record<string, string>) => {
    setMessage(null);
    setSavingSection(section);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: data }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!', section });
        // Limpa os campos após salvar
        if (section === 'wavespeed') setWavespeedKey('');
        if (section === 'brevo') {
          setBrevoKey('');
          setSenderName('');
          setSenderEmail('');
        }
        if (section === 'payt') setPaytKey('');
        fetchSettings();
      } else {
        const result = await response.json();
        setMessage({ type: 'error', text: result.error || 'Erro ao salvar', section });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações', section });
    } finally {
      setSavingSection(null);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Digite um email para teste', section: 'brevo' });
      return;
    }

    setIsSendingTest(true);
    setMessage(null);

    try {
      // Usa endpoint interno do admin (mesmo servidor)
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          nome: 'Teste Admin',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: `Email de teste enviado para ${testEmail}!`, section: 'brevo' });
        setTestEmail('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao enviar email de teste', section: 'brevo' });
      }
    } catch (error) {
      console.error('[TEST EMAIL] Erro:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setMessage({ type: 'error', text: `Erro ao conectar: ${errorMsg}`, section: 'brevo' });
    } finally {
      setIsSendingTest(false);
    }
  };

  if (status === 'loading' || !session?.user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderStatusBadge = (setting: SettingStatus | undefined) => {
    if (!setting) return null;

    if (setting.hasValue) {
      return (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <FiCheck className="w-4 h-4" />
          <span className="font-mono">{setting.value}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-yellow-600 text-sm">
        <FiAlertCircle className="w-4 h-4" />
        <span>Não configurado</span>
      </div>
    );
  };

  const renderMessage = (section: string) => {
    if (!message || message.section !== section) return null;

    return (
      <div
        className={`mt-4 p-3 rounded-xl flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}
      >
        {message.type === 'success' ? (
          <FiCheck className="w-4 h-4 flex-shrink-0" />
        ) : (
          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
        )}
        <span className="text-sm">{message.text}</span>
      </div>
    );
  };

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
              <div className="p-2 bg-[#4A7C59]/10 rounded-xl">
                <FiServer className="w-5 h-5 text-[#4A7C59]" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Configurações do Sistema</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A7C59]"></div>
          </div>
        ) : (
          <>
            {/* WaveSpeed API */}
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <FiKey className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">WaveSpeed API</h2>
                  <p className="text-sm text-gray-500">API para geração de imagens e IA</p>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-sm text-gray-600">Status atual:</span>
                <div className="mt-1">{renderStatusBadge(settings?.wavespeed_api_key)}</div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key WaveSpeed
                  </label>
                  <input
                    type="password"
                    placeholder="Sua API Key do WaveSpeed"
                    value={wavespeedKey}
                    onChange={(e) => setWavespeedKey(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent transition-all"
                  />
                </div>

                <button
                  onClick={() => handleSaveSection('wavespeed', { wavespeed_api_key: wavespeedKey })}
                  disabled={savingSection === 'wavespeed' || !wavespeedKey}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {savingSection === 'wavespeed' ? 'Salvando...' : 'Salvar API Key'}
                </button>

                {renderMessage('wavespeed')}
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Obtenha sua API Key em{' '}
                <a href="https://wavespeed.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  wavespeed.ai
                </a>
              </p>
            </div>

            {/* Brevo (Email) */}
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#4A7C59]/10 rounded-xl">
                  <FiMail className="w-5 h-5 text-[#4A7C59]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Brevo (Email)</h2>
                  <p className="text-sm text-gray-500">Configurações de envio de email transacional</p>
                </div>
              </div>

              {/* Status das configurações */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">API Key</span>
                  {renderStatusBadge(settings?.brevo_api_key)}
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Nome do Remetente</span>
                  {renderStatusBadge(settings?.email_sender_name)}
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Email Remetente</span>
                  {renderStatusBadge(settings?.email_sender_address)}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key Brevo
                  </label>
                  <input
                    type="password"
                    placeholder="Sua API Key do Brevo"
                    value={brevoKey}
                    onChange={(e) => setBrevoKey(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Remetente
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Sage IA"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Remetente
                    </label>
                    <input
                      type="email"
                      placeholder="Ex: contato@seusite.com"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleSaveSection('brevo', {
                    brevo_api_key: brevoKey,
                    email_sender_name: senderName,
                    email_sender_address: senderEmail,
                  })}
                  disabled={savingSection === 'brevo' || (!brevoKey && !senderName && !senderEmail)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#4A7C59] to-[#3d6a4a] text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {savingSection === 'brevo' ? 'Salvando...' : 'Salvar Configurações de Email'}
                </button>

                {renderMessage('brevo')}
              </div>

              {/* Teste de Email */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FiSend className="w-4 h-4" />
                  Testar Envio de Email
                </h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Digite um email para teste"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent transition-all text-sm"
                  />
                  <button
                    onClick={handleTestEmail}
                    disabled={isSendingTest || !testEmail}
                    className="px-4 py-2.5 bg-[#4A7C59] text-white font-medium rounded-xl hover:bg-[#3d6a4a] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                  >
                    {isSendingTest ? 'Enviando...' : 'Enviar Teste'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Envia um email de boas-vindas de teste para verificar a configuração
                </p>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Crie sua conta e obtenha a API Key em{' '}
                <a href="https://www.brevo.com" target="_blank" rel="noopener noreferrer" className="text-[#4A7C59] hover:underline">
                  brevo.com
                </a>
              </p>
            </div>

            {/* Payt Integration */}
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <FiKey className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Payt (Pagamentos)</h2>
                  <p className="text-sm text-gray-500">Chave de integração para webhooks de pagamento</p>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-sm text-gray-600">Status atual:</span>
                <div className="mt-1">{renderStatusBadge(settings?.payt_integration_key)}</div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Integration Key Payt
                  </label>
                  <input
                    type="password"
                    placeholder="Sua Integration Key do Payt"
                    value={paytKey}
                    onChange={(e) => setPaytKey(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent transition-all"
                  />
                </div>

                <button
                  onClick={() => handleSaveSection('payt', { payt_integration_key: paytKey })}
                  disabled={savingSection === 'payt' || !paytKey}
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {savingSection === 'payt' ? 'Salvando...' : 'Salvar Integration Key'}
                </button>

                {renderMessage('payt')}
              </div>

              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <p className="text-sm text-orange-800">
                  <strong>URL do Webhook:</strong>
                </p>
                <code className="text-xs bg-white px-2 py-1 rounded mt-1 block overflow-x-auto">
                  {typeof window !== 'undefined' ? window.location.origin.replace(':3001', ':3000') : 'https://seusite.com'}/api/webhook/payt
                </code>
                <p className="text-xs text-orange-600 mt-2">
                  Configure esta URL no painel do Payt para receber notificações de pagamento
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Como funciona?</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Configure a <strong>API Key do WaveSpeed</strong> para habilitar o chat e geração de imagens</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>Configure o <strong>Brevo</strong> para enviar emails automáticos de boas-vindas e renovação</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Configure o <strong>Payt</strong> para receber notificações de pagamento e criar usuários automaticamente</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
