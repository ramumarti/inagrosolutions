"use client";

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  Bug, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';

const PESTS = [
  {
    name: 'Mosca del Olivo',
    risk: 'Alto',
    area: 'Zona Sur (Jaén)',
    color: 'text-red-400',
    bgColor: 'bg-red-400/10'
  },
  {
    name: 'Prays del Olivo',
    risk: 'Medio',
    area: 'Gral. Explotación',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10'
  }
];

export function PestAlerts() {
  return (
    <GlassCard className="p-6 border border-red-500/10 bg-red-500/[0.02]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-red-500/10 p-2 rounded-xl">
            <Bug className="w-5 h-5 text-red-400" />
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Alertas Fitosanitarias</h4>
        </div>
        <div className="bg-red-500/20 px-2 py-0.5 rounded text-[8px] font-black text-red-400 uppercase animate-pulse">
          Nivel Crítico
        </div>
      </div>

      <div className="space-y-4">
        {PESTS.map((pest, i) => (
          <div key={i} className="flex flex-col gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{pest.name}</span>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${pest.bgColor} ${pest.color}`}>
                Riesgo {pest.risk}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 text-white/40">
                <MapPin size={10} />
                {pest.area}
              </div>
              <div className="flex items-center gap-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                Ver Detalles <ArrowRight size={10} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 text-[10px] text-white/40">
          <TrendingUp size={12} className="text-emerald-400" />
          <span>Probabilidad biológica aumentada por clima cálido (+{Math.floor(Math.random() * 20) + 10}%)</span>
        </div>
      </div>
    </GlassCard>
  );
}
