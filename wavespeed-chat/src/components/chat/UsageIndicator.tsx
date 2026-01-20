'use client';

import { useState, useEffect } from 'react';
import { FiZap, FiAlertCircle } from 'react-icons/fi';

interface UsageData {
  plan: string;
  current: number;
  limit: number;
  remaining: number;
  planExpired: boolean;
  expiresAt: string | null;
  resetsAt: string;
}

interface UsageIndicatorProps {
  onUpgradeClick: () => void;
}

export default function UsageIndicator({ onUpgradeClick }: UsageIndicatorProps) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/user/usage');
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  // Atualiza o uso a cada resposta do chat
  useEffect(() => {
    const handleUsageUpdate = (event: CustomEvent<UsageData>) => {
      setUsage(prev => prev ? { ...prev, ...event.detail } : event.detail);
    };

    window.addEventListener('usageUpdated' as any, handleUsageUpdate);
    return () => {
      window.removeEventListener('usageUpdated' as any, handleUsageUpdate);
    };
  }, []);

  if (loading || !usage) {
    return null;
  }

  const percentage = (usage.current / usage.limit) * 100;
  const isWarning = percentage >= 80;
  const isNearLimit = percentage >= 90;
  const isPlanExpired = usage.planExpired;

  // Se o plano expirou
  if (isPlanExpired) {
    return (
      <button
        onClick={onUpgradeClick}
        className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
      >
        <FiAlertCircle className="w-4 h-4" />
        <span className="text-xs font-medium">Plano expirado</span>
      </button>
    );
  }

  return (
    <button
      onClick={onUpgradeClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
        isNearLimit
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : isWarning
          ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
          : 'bg-[#4A7C5910] text-[#4A7C59] hover:bg-[#4A7C5920]'
      }`}
    >
      <FiZap className="w-4 h-4" />
      <span className="text-xs font-medium">
        {usage.current}/{usage.limit}
      </span>
      {usage.plan === 'basic' && (
        <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 bg-white/50 rounded">
          Upgrade
        </span>
      )}
    </button>
  );
}
