'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FiArrowLeft,
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiCheck,
  FiX,
  FiClock,
  FiRefreshCw,
  FiEye,
  FiCopy,
} from 'react-icons/fi';
import Link from 'next/link';

interface Purchase {
  id: string;
  transactionId: string;
  status: string;
  type: string;
  customerName: string;
  customerEmail: string;
  customerDoc: string | null;
  customerPhone: string | null;
  productName: string | null;
  productPrice: number | null;
  paymentMethod: string | null;
  totalPrice: number;
  processed: boolean;
  errorMessage: string | null;
  userId: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  } | null;
}

interface Stats {
  total: number;
  paid: number;
  totalRevenue: number;
  usersCreated: number;
}

export default function PurchasesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.isAdmin) {
      router.push('/login');
      return;
    }
    fetchPurchases();
  }, [session, status, router]);

  const fetchPurchases = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/purchases');
      if (response.ok) {
        const data = await response.json();
        setPurchases(data.purchases);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
      paid: { color: 'bg-green-500/20 text-green-300', label: 'Pago', icon: <FiCheck className="w-3 h-3" /> },
      waiting_payment: { color: 'bg-yellow-500/20 text-yellow-300', label: 'Aguardando', icon: <FiClock className="w-3 h-3" /> },
      canceled: { color: 'bg-red-500/20 text-red-300', label: 'Cancelado', icon: <FiX className="w-3 h-3" /> },
      refunded: { color: 'bg-orange-500/20 text-orange-300', label: 'Reembolsado', icon: <FiRefreshCw className="w-3 h-3" /> },
      error: { color: 'bg-red-500/20 text-red-300', label: 'Erro', icon: <FiX className="w-3 h-3" /> },
    };
    const config = statusConfig[status] || { color: 'bg-gray-500/20 text-gray-300', label: status, icon: null };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (status === 'loading' || !session?.user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(17,24,39)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
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
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <FiShoppingBag className="w-5 h-5 text-green-400" />
                </div>
                <h1 className="text-lg font-bold text-white">Compras Payt</h1>
              </div>
            </div>
            <button
              onClick={fetchPurchases}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-xl font-medium transition-colors"
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[rgb(31,41,55)] rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FiShoppingBag className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Webhooks</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-[rgb(31,41,55)] rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <FiCheck className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Compras Pagas</p>
                  <p className="text-2xl font-bold text-white">{stats.paid}</p>
                </div>
              </div>
            </div>
            <div className="bg-[rgb(31,41,55)] rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <FiDollarSign className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Receita Total</p>
                  <p className="text-2xl font-bold text-white">{formatPrice(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>
            <div className="bg-[rgb(31,41,55)] rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <FiUsers className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Usuários Criados</p>
                  <p className="text-2xl font-bold text-white">{stats.usersCreated}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Purchases Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-12 bg-[rgb(31,41,55)] rounded-xl border border-gray-700">
            <FiShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Nenhuma compra encontrada</h3>
            <p className="text-gray-500">Os webhooks do Payt aparecerão aqui.</p>
            <p className="text-sm text-gray-600 mt-4">
              Configure a URL do webhook no Payt:<br />
              <code className="bg-[rgb(17,24,39)] px-2 py-1 rounded text-green-400">
                https://chat.sageapp.com.br/api/webhook/payt
              </code>
            </p>
          </div>
        ) : (
          <div className="bg-[rgb(31,41,55)] shadow-xl rounded-2xl border border-gray-700 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-[rgb(17,24,39)]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-white">{purchase.customerName}</p>
                        <p className="text-xs text-gray-400">{purchase.customerEmail}</p>
                        {purchase.customerPhone && (
                          <p className="text-xs text-gray-500">{purchase.customerPhone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-300">{purchase.productName || '-'}</p>
                      <p className="text-xs text-gray-500">{purchase.type}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-green-400">
                        {formatPrice(purchase.totalPrice)}
                      </p>
                      <p className="text-xs text-gray-500">{purchase.paymentMethod || '-'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(purchase.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {purchase.user ? (
                        <div className="flex items-center gap-2">
                          <FiCheck className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">Vinculado</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(purchase.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyToClipboard(purchase.transactionId, purchase.id)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
                          title="Copiar Transaction ID"
                        >
                          {copiedId === purchase.id ? (
                            <FiCheck className="w-4 h-4 text-green-400" />
                          ) : (
                            <FiCopy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setSelectedPurchase(purchase)}
                          className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[rgb(31,41,55)] rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white">Detalhes da Compra</h2>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Transaction ID</p>
                  <p className="text-sm text-white font-mono">{selectedPurchase.transactionId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  {getStatusBadge(selectedPurchase.status)}
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Cliente</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Nome</p>
                    <p className="text-sm text-white">{selectedPurchase.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Email</p>
                    <p className="text-sm text-white">{selectedPurchase.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">CPF/CNPJ</p>
                    <p className="text-sm text-white">{selectedPurchase.customerDoc || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Telefone</p>
                    <p className="text-sm text-white">{selectedPurchase.customerPhone || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Produto</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Nome</p>
                    <p className="text-sm text-white">{selectedPurchase.productName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Valor</p>
                    <p className="text-sm text-green-400 font-medium">
                      {formatPrice(selectedPurchase.totalPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Tipo</p>
                    <p className="text-sm text-white">{selectedPurchase.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Método de Pagamento</p>
                    <p className="text-sm text-white">{selectedPurchase.paymentMethod || '-'}</p>
                  </div>
                </div>
              </div>

              {selectedPurchase.user && (
                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Usuário Criado</h3>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-green-400">
                      <FiCheck className="w-4 h-4" />
                      <span className="text-sm font-medium">Usuário vinculado com sucesso</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-2">
                      {selectedPurchase.user.name || selectedPurchase.user.email}
                    </p>
                  </div>
                </div>
              )}

              {selectedPurchase.errorMessage && (
                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Erro</h3>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-sm text-red-400">{selectedPurchase.errorMessage}</p>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-700 pt-4">
                <p className="text-xs text-gray-400 mb-1">Data</p>
                <p className="text-sm text-white">
                  {new Date(selectedPurchase.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
