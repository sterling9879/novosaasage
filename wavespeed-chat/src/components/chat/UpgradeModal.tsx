'use client';

import { FiX, FiZap, FiCheck, FiClock, FiMessageSquare, FiStar } from 'react-icons/fi';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  planExpired?: boolean;
  limitReached?: boolean;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  currentPlan = 'basic',
  planExpired = false,
  limitReached = false,
}: UpgradeModalProps) {
  if (!isOpen) return null;

  // URLs dos planos no Payt (substituir pelas URLs reais)
  const PLAN_URLS = {
    basic: 'https://pay.payt.com.br/seu-produto-basico', // R$ 37
    pro: 'https://pay.payt.com.br/seu-produto-pro', // R$ 97
  };

  const handleUpgrade = (planUrl: string) => {
    window.open(planUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#4A7C59] to-[#1E3A2F] px-6 py-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>

          <div className="text-center">
            {planExpired ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <FiClock className="w-8 h-8 text-red-300" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Seu plano expirou</h2>
                <p className="text-white/80">Renove agora para continuar usando o Sage</p>
              </>
            ) : limitReached ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <FiMessageSquare className="w-8 h-8 text-orange-300" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Limite diario atingido</h2>
                <p className="text-white/80">
                  Seu uso diario foi esgotado. Volte amanha ou faca upgrade!
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                  <FiZap className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Upgrade seu plano</h2>
                <p className="text-white/80">Desbloqueie mais recursos e uso diario</p>
              </>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="p-6 space-y-4">
          {/* Plano Basico */}
          <div
            className={`relative p-4 rounded-xl border-2 transition-all ${
              currentPlan === 'basic'
                ? 'border-[#4A7C59] bg-[#4A7C5908]'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {currentPlan === 'basic' && (
              <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-[#4A7C59] text-white text-[10px] font-bold rounded">
                SEU PLANO
              </span>
            )}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-[#1E3A2F]">Plano Basico</h3>
                <p className="text-sm text-gray-500 mt-1">Acesso ao Sage IA</p>
                <ul className="mt-3 space-y-1.5">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <FiCheck className="w-4 h-4 text-[#4A7C59]" />
                    Acesso a todos os modelos
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <FiCheck className="w-4 h-4 text-[#4A7C59]" />
                    Historico de conversas
                  </li>
                </ul>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#1E3A2F]">R$ 37</p>
                <p className="text-xs text-gray-500">/mes</p>
              </div>
            </div>
            {currentPlan !== 'basic' && (
              <button
                onClick={() => handleUpgrade(PLAN_URLS.basic)}
                className="w-full mt-4 py-2.5 border-2 border-[#4A7C59] text-[#4A7C59] font-semibold rounded-xl hover:bg-[#4A7C5908] transition-colors"
              >
                Escolher Basico
              </button>
            )}
            {currentPlan === 'basic' && planExpired && (
              <button
                onClick={() => handleUpgrade(PLAN_URLS.basic)}
                className="w-full mt-4 py-2.5 bg-[#4A7C59] text-white font-semibold rounded-xl hover:bg-[#3d6a4a] transition-colors"
              >
                Renovar Plano
              </button>
            )}
          </div>

          {/* Plano Pro */}
          <div className="relative p-4 rounded-xl border-2 border-[#C9A227] bg-gradient-to-br from-[#C9A22708] to-transparent">
            <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-white text-[10px] font-bold rounded">
              RECOMENDADO
            </span>
            {currentPlan === 'pro' && (
              <span className="absolute -top-2.5 right-4 px-2 py-0.5 bg-[#4A7C59] text-white text-[10px] font-bold rounded">
                SEU PLANO
              </span>
            )}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#1E3A2F]">Plano Pro</h3>
                  <FiStar className="w-4 h-4 text-[#C9A227]" />
                </div>
                <p className="text-sm text-gray-500 mt-1">5x mais uso diario</p>
                <ul className="mt-3 space-y-1.5">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <FiCheck className="w-4 h-4 text-[#C9A227]" />
                    <strong>5x mais uso diario</strong>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <FiCheck className="w-4 h-4 text-[#C9A227]" />
                    Acesso a todos os modelos
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <FiCheck className="w-4 h-4 text-[#C9A227]" />
                    GPT-5, Claude 3.7, Gemini Pro
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <FiCheck className="w-4 h-4 text-[#C9A227]" />
                    Suporte prioritario
                  </li>
                </ul>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#1E3A2F]">R$ 97</p>
                <p className="text-xs text-gray-500">/mes</p>
              </div>
            </div>
            {currentPlan === 'pro' && !planExpired ? (
              <div className="w-full mt-4 py-2.5 text-center text-[#4A7C59] font-semibold">
                Voce ja tem este plano
              </div>
            ) : (
              <button
                onClick={() => handleUpgrade(PLAN_URLS.pro)}
                className="w-full mt-4 py-2.5 bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                {currentPlan === 'pro' ? 'Renovar Pro' : 'Fazer Upgrade para Pro'}
              </button>
            )}
          </div>

          {/* Info */}
          {limitReached && !planExpired && (
            <p className="text-center text-sm text-gray-500 pt-2">
              Seu limite reseta a meia-noite. Ou faca upgrade para 5x mais uso!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
