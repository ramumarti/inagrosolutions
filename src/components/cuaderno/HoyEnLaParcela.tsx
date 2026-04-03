'use client';

import React from 'react';
import type { ResumenDiario } from '@/hooks/useAgriProfile';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  Leaf, MapPin, Bug, Droplets, Bell, Sun, CloudRain,
  TrendingUp, Calendar
} from 'lucide-react';

interface HoyEnLaParcelaProps {
  resumen: ResumenDiario;
  alertasPendientes: number;
  onAction?: (action: string) => void;
}

export function HoyEnLaParcela({ resumen, alertasPendientes, onAction }: HoyEnLaParcelaProps) {
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Greeting + Weather */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            {saludo}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Agricultor</span>
          </h1>
          <p className="text-white/30 mt-2 text-xs font-bold uppercase tracking-[0.2em]">
            {resumen.nombre_explotacion} • {resumen.total_hectareas.toFixed(1)} ha
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 rounded-xl border border-white/5">
            <Sun size={14} className="text-amber-400" />
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">24°C</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 rounded-xl border border-white/5">
            <CloudRain size={14} className="text-blue-400" />
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">0%</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Parcelas', value: resumen.total_parcelas, icon: MapPin, color: 'emerald' },
          { label: 'Tratamientos Hoy', value: resumen.tratamientos_hoy, icon: Bug, color: 'blue' },
          { label: 'Labores Hoy', value: resumen.labores_hoy, icon: Leaf, color: 'violet' },
          { label: 'Alertas', value: alertasPendientes, icon: Bell, color: alertasPendientes > 0 ? 'amber' : 'emerald' },
        ].map((stat, i) => (
          <GlassCard key={i} className="p-5 border-white/5 hover:bg-white/[0.03] transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 bg-${stat.color}-500/10 rounded-xl text-${stat.color}-400 border border-${stat.color}-500/10`}>
                <stat.icon size={18} />
              </div>
              {stat.label === 'Alertas' && alertasPendientes > 0 && (
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              )}
            </div>
            <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5">{stat.label}</div>
            <div className="text-2xl font-black text-white tracking-tight">{stat.value}</div>
          </GlassCard>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Registrar Tratamiento', icon: Bug, tab: 'fitosanitarios', color: 'from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border-blue-500/20' },
          { label: 'Nueva Labor', icon: Leaf, tab: 'labores', color: 'from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-600/30 border-emerald-500/20' },
          { label: 'Fertilización', icon: Droplets, tab: 'fertilizacion', color: 'from-violet-500/20 to-violet-600/20 hover:from-violet-500/30 hover:to-violet-600/30 border-violet-500/20' },
          { label: 'Ver Calendario', icon: Calendar, tab: 'calendario', color: 'from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border-amber-500/20' },
        ].map((action, i) => (
          <button
            type="button"
            key={i}
            onClick={() => onAction && onAction(action.tab)}
            className={`flex items-center text-left gap-3 w-full p-4 bg-gradient-to-br ${action.color} border rounded-xl transition-all active:scale-[0.98] group`}
          >
            <action.icon size={18} className="text-white/60 group-hover:text-white transition-colors shrink-0" />
            <span className="text-[10px] font-black text-white/70 uppercase tracking-widest group-hover:text-white transition-colors">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
