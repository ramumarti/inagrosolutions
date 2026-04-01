"use client";

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  Sparkles, 
  CloudRain, 
  Thermometer, 
  AlertCircle,
  ArrowRight,
  Wind,
  Droplets,
  CheckCircle2
} from 'lucide-react';
import { WeatherAlertService, SmartAlert } from '@/lib/agriculture/weather-alerts';

export function SmartAssistant() {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);

  useEffect(() => {
    // Integration point for weather API
    // For now, simulate real-time telemetry from the olive grove
    const currentTelemetry = {
      temp: 18,
      humidity: 85,
      windSpeed: 22,
      precip: 0
    };
    
    const calculatedAlerts = WeatherAlertService.getAlerts(currentTelemetry);
    setAlerts(calculatedAlerts);
  }, []);

  if (alerts.length === 0) return null;

  // Show the most critical alert
  const alert = alerts[0];
  
  const colors = {
    high: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400' },
    medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
    low: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' }
  };

  const currentColors = colors[alert.severity];

  const IconMap: { [key: string]: React.ElementType } = {
    CloudRain, Thermometer, Wind, Droplets, Check: CheckCircle2, AlertCircle
  };

  const Icon = IconMap[alert.icon] || AlertCircle;

  return (
    <GlassCard className={`p-5 mb-6 border ${currentColors.border} ${currentColors.bg} backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-5 duration-700`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-2xl ${currentColors.bg} border ${currentColors.border} shadow-lg`}>
          <Icon className={`w-6 h-6 ${currentColors.text}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`text-sm font-black uppercase tracking-tight ${currentColors.text}`}>{alert.title}</h4>
            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">Predictor IA</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-sm mb-4">
            {alert.description}
          </p>
          <button className={`group text-[10px] font-black uppercase ${currentColors.text} flex items-center gap-2 hover:bg-white/5 py-2 px-3 rounded-xl transition-all border border-transparent hover:border-white/10`}>
             Optimizar Operación <ArrowRight size={14} className="group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

