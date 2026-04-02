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
import { Badge } from '@/components/ui/Badge';

import { useRouter } from 'next/navigation';

export function SmartAssistant() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);

  useEffect(() => {
    // 💡 LIVE SIMULATION (Integration point for weather/telemetry API)
    // We simulate current conditions: 18°C, 85% humidity (triggering High Repilo Risk)
    // In production, this data comes from local weather stations (AEMET/SIAR)
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
    high: { 
      bg: 'bg-rose-500/5', 
      border: 'border-rose-500/10', 
      text: 'text-rose-400', 
      title: 'text-rose-300',
      shadow: 'shadow-[0_20px_50px_rgba(244,63,94,0.1)]',
      iconBox: 'bg-rose-500/10 border-rose-500/20'
    },
    medium: { 
      bg: 'bg-amber-500/5', 
      border: 'border-amber-500/10', 
      text: 'text-amber-400', 
      title: 'text-amber-300',
      shadow: 'shadow-lg shadow-amber-500/5',
      iconBox: 'bg-amber-500/10 border-amber-500/20'
    },
    low: { 
      bg: 'bg-blue-500/5', 
      border: 'border-blue-500/10', 
      text: 'text-blue-400', 
      title: 'text-blue-300',
      shadow: 'shadow-lg shadow-blue-500/5',
      iconBox: 'bg-blue-500/10 border-blue-500/20'
    },
    success: { 
      bg: 'bg-emerald-500/5', 
      border: 'border-emerald-500/10', 
      text: 'text-emerald-400', 
      title: 'text-emerald-300',
      shadow: 'shadow-lg shadow-emerald-500/5',
      iconBox: 'bg-emerald-500/10 border-emerald-500/20'
    }
  };

  const currentColors = colors[alert.severity];

  const IconMap: { [key: string]: React.ElementType } = {
    CloudRain, Thermometer, Wind, Droplets, Check: CheckCircle2, AlertCircle
  };

  const Icon = IconMap[alert.icon] || AlertCircle;

  return (
    <div className={`p-6 mb-8 rounded-[40px] border ${currentColors.border} ${currentColors.bg} ${currentColors.shadow} backdrop-blur-xl relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700`}>
      <div className="flex items-start gap-4">
        <div className={`p-4 rounded-3xl border ${currentColors.iconBox} shadow-inner`}>
          <Icon className={`w-8 h-8 ${currentColors.text}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className={`text-[15px] font-black uppercase tracking-tight ${currentColors.title}`}>{alert.title}</h4>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.1em] mt-0.5">Analizando Telemetría en Vivo</p>
            </div>
            <Badge variant="success" className="gap-1.5 px-3 py-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-300 shadow-md animate-pulse">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              PREDICTOR IA
            </Badge>
          </div>
          <p className="text-sm text-white/50 font-medium leading-relaxed max-w-sm mb-5 pr-4">
            {alert.description}
          </p>
          <button 
            onClick={() => router.push(alert.id === 'repilo' ? '/cuaderno/tratamientos' : '/cuaderno')}
            className={`group text-[11px] font-black uppercase ${currentColors.text} flex items-center gap-2 hover:translate-x-1 transition-all underline underline-offset-8 decoration-2 decoration-current/30 hover:decoration-current`}
          >
             Optimizar Operación <ArrowRight size={14} className="group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
}


