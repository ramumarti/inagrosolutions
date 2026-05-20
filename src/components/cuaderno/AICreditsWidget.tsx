'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Zap, ChevronRight } from 'lucide-react';

interface AICreditsData {
  credits_included: number;
  credits_purchased: number;
  credits_used: number;
  credits_remaining: number;
  period_start: string;
  period_end: string;
}

interface AICreditsWidgetProps {
  onBuyCredits?: () => void;
  compact?: boolean;
}

export function AICreditsWidget({ onBuyCredits, compact = false }: AICreditsWidgetProps) {
  const [data, setData] = useState<AICreditsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ai/credits')
      .then(res => res.json())
      .then(d => {
        if (!d.error) setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="px-3 py-2 animate-pulse">
        <div className="h-2 bg-white/5 rounded-full w-full" />
      </div>
    );
  }

  if (!data) return null;

  const total = data.credits_included + data.credits_purchased;
  const percentage = total > 0 ? Math.min((data.credits_used / total) * 100, 100) : 0;
  const remaining = data.credits_remaining;
  const isLow = remaining > 0 && remaining <= 5;
  const isEmpty = remaining <= 0;
  const hasNoAI = total === 0;

  // Plan Básico: sin IA
  if (hasNoAI) {
    if (compact) return null;
    return (
      <button
        onClick={onBuyCredits}
        className="w-full px-3 py-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 flex items-center gap-2 group hover:border-violet-500/40 transition-all"
      >
        <Sparkles size={16} className="text-violet-400 shrink-0" />
        <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider flex-1 text-left">
          Activar IA
        </span>
        <ChevronRight size={14} className="text-violet-400/50 group-hover:text-violet-400 transition-colors" />
      </button>
    );
  }

  const barColor = isEmpty
    ? 'bg-red-500'
    : isLow
    ? 'bg-amber-500'
    : 'bg-gradient-to-r from-violet-500 to-indigo-500';

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-2">
        <Zap size={12} className={isEmpty ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-violet-400'} />
        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${100 - percentage}%` }}
          />
        </div>
        <span className="text-[9px] font-black text-white/40">{remaining}</span>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-violet-400" />
          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Créditos IA</span>
        </div>
        <span className={`text-sm font-black ${isEmpty ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-white'}`}>
          {remaining}
          <span className="text-white/20 font-bold text-[10px]">/{total}</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${100 - percentage}%` }}
        />
      </div>

      {/* Status message */}
      {isEmpty && (
        <button
          onClick={onBuyCredits}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition-all group"
        >
          <Zap size={12} className="text-violet-400" />
          <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider">
            Comprar Créditos
          </span>
        </button>
      )}
      {isLow && !isEmpty && (
        <p className="text-[9px] text-amber-400/70 font-bold text-center">
          ⚡ Quedan pocos créditos
        </p>
      )}
    </div>
  );
}
