"use client";

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  Sparkles, 
  CloudRain, 
  Thermometer, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export function SmartAssistant() {
  const [suggestion, setSuggestion] = useState<{
    title: string;
    description: string;
    type: 'success' | 'warning' | 'info';
    icon: any;
  } | null>(null);

  useEffect(() => {
    // Simulated IA logic based on weather
    const suggestions = [
      {
        title: "Momento óptimo para abonado",
        description: "Lluvia de 5mm prevista para mañana. Aplica el nitrógeno hoy para mejorar la absorción radicular.",
        type: 'success' as const,
        icon: CloudRain
      },
      {
        title: "Riesgo de estrés hídrico",
        description: "Temperaturas >32°C previstas. Considera un riego de mantenimiento de 2h/sector en la Parcela Norte.",
        type: 'warning' as const,
        icon: Thermometer
      },
      {
        title: "Cuidado con el viento",
        description: "Viento >20km/h mañana. Evita tratamientos fitosanitarios por riesgo de deriva.",
        type: 'info' as const,
        icon: AlertCircle
      }
    ];
    setSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
  }, []);

  if (!suggestion) return null;

  const Icon = suggestion.icon;
  const colorClass = suggestion.type === 'success' ? 'emerald-400' : suggestion.type === 'warning' ? 'amber-400' : 'blue-400';

  return (
    <GlassCard className="p-5 border border-emerald-500/20 bg-emerald-950/20 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl bg-${colorClass}/10 border border-${colorClass}/20`}>
          <Sparkles className={`w-5 h-5 text-${colorClass}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-white">{suggestion.title}</h4>
            <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded">Recomendación IA</span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed max-w-sm mb-4">
            {suggestion.description}
          </p>
          <div className="flex items-center gap-3">
            <button className={`text-[10px] font-black uppercase text-${colorClass} flex items-center gap-1.5 hover:translate-x-1 transition-transform`}>
               Aplicar Recomendación <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
