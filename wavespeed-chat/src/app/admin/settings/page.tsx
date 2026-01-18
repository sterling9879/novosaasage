'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminSettings() {
  const [apiKey, setApiKey] = useState('');
  const [currentApiKey, setCurrentApiKey] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

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
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar API Key' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Configurações</h2>

      <div className="bg-white shadow rounded-lg p-6 max-w-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-4">API Key WaveSpeed</h3>

        {hasApiKey && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              API Key configurada: <code className="font-mono">{currentApiKey}</code>
            </p>
          </div>
        )}

        {!hasApiKey && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Nenhuma API Key configurada. O chat não funcionará sem ela.
            </p>
          </div>
        )}

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label={hasApiKey ? 'Nova API Key (deixe vazio para manter a atual)' : 'API Key'}
            type="password"
            placeholder="Sua API Key do WaveSpeed"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />

          <Button type="submit" isLoading={isSaving}>
            Salvar API Key
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
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
    </div>
  );
}
