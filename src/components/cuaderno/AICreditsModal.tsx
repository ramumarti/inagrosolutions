'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Sparkles, Zap, XCircle, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';
import { AI_CREDIT_PACKS } from '@/lib/ai-constants';

interface AICreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditsRemaining: number;
  creditsNeeded: number;
  featureName: string;
  upgradeMessage?: string;
}

export function AICreditsModal({
  isOpen,
  onClose,
  creditsRemaining,
  creditsNeeded,
  featureName,
  upgradeMessage,
}: AICreditsModalProps) {
  const [purchasing, setPurchasing] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBuyPack = async (packId: string) => {
    setPurchasing(packId);
    try {
      const res = await fetch('/api/ai/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Error al iniciar la compra');
        setPurchasing(null);
      }
    } catch {
      alert('Error de conexión');
      setPurchasing(null);
    }
  };

  const isBasicPlan = creditsRemaining === 0 && creditsNeeded > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      
      <GlassCard className="w-full max-w-lg relative p-0 border-white/10 overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-violet-500/20 via-indigo-500/10 to-transparent p-8 pb-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
          >
            <XCircle size={20} />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-violet-500/20 border border-violet-500/30 rounded-2xl flex items-center justify-center shrink-0">
              <Sparkles size={24} className="text-violet-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {isBasicPlan ? 'Funciones de IA Premium' : 'Créditos IA Agotados'}
              </h3>
              <p className="text-sm text-white/50 font-bold mt-1">
                {upgradeMessage || `Necesitas ${creditsNeeded} créditos para usar ${featureName}`}
              </p>
            </div>
          </div>

          {/* Credits indicator */}
          {!isBasicPlan && (
            <div className="mt-4 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              <Zap size={16} className="text-red-400" />
              <span className="text-sm font-bold text-red-300">
                {creditsRemaining} créditos restantes — necesitas {creditsNeeded}
              </span>
            </div>
          )}
        </div>

        {/* Packs grid */}
        <div className="p-6 space-y-4">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
            Packs de Créditos IA
          </p>

          <div className="grid gap-3">
            {AI_CREDIT_PACKS.map((pack, i) => {
              const isPopular = i === 1; // Pack Pro es el recomendado
              return (
                <button
                  key={pack.id}
                  onClick={() => handleBuyPack(pack.id)}
                  disabled={!!purchasing}
                  className={`relative flex items-center justify-between p-4 rounded-xl border transition-all group ${
                    isPopular
                      ? 'bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/20 hover:border-violet-500/50'
                      : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                  } ${purchasing === pack.id ? 'opacity-50 cursor-wait' : 'active:scale-[0.98]'}`}
                >
                  {isPopular && (
                    <div className="absolute -top-2 right-4 px-2 py-0.5 bg-violet-500 rounded text-[8px] font-black text-white uppercase tracking-widest">
                      Recomendado
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isPopular ? 'bg-violet-500/20' : 'bg-white/5'
                    }`}>
                      <Zap size={18} className={isPopular ? 'text-violet-400' : 'text-white/50'} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">{pack.label}</p>
                      <p className="text-[10px] text-white/40 font-bold">{pack.credits} créditos</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white">{pack.price.toFixed(2)}€</span>
                    <ArrowRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Upgrade CTA for basic plan */}
          {isBasicPlan && (
            <a
              href="/cuaderno/suscripcion"
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/30 rounded-xl text-sm font-bold text-violet-300 hover:text-white transition-all"
            >
              <ShieldCheck size={16} />
              Mejorar mi Plan para incluir créditos IA
            </a>
          )}

          {/* Trust */}
          <div className="flex items-center justify-center gap-4 pt-2 opacity-30">
            <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-white">
              <CreditCard size={10} /> Stripe Seguro
            </div>
            <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-white">
              <ShieldCheck size={10} /> Pago Único
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
