'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Lock } from 'lucide-react';
import type { AgriTier } from '@/lib/modules';
import { TIER_CONFIG } from '@/lib/modules';

interface ModuleGateProps {
  children: React.ReactNode;
  isActive: boolean;
  tierMinimo: AgriTier;
  moduleName: string;
  userTier: AgriTier;
}

export function ModuleGate({ children, isActive, tierMinimo, moduleName, userTier }: ModuleGateProps) {
  if (isActive) return <>{children}</>;

  const tierInfo = TIER_CONFIG[tierMinimo];

  return (
    <GlassCard className="p-8 border-white/5 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-white/[0.03] pointer-events-none" />
      
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-[#050510]/60 z-10 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Lock className="w-7 h-7 text-white/30" />
        </div>
        <div className="text-center space-y-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide">{moduleName}</h4>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
            Requiere plan {tierInfo.label_es} o superior
          </p>
        </div>
        <button className={`mt-2 px-6 py-2.5 bg-gradient-to-r ${tierInfo.gradient} rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:scale-105 transition-transform shadow-lg`}>
          Obtener {tierInfo.label_es}
        </button>
      </div>

      {/* Blurred preview */}
      <div className="filter blur-sm opacity-30 pointer-events-none select-none">
        {children}
      </div>
    </GlassCard>
  );
}
