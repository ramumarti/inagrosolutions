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
    <div className={`p-6 mb-8 rounded-[40px] border ${currentColors.border} ${currentColors.bg} ${currentColors.shadow} transition-all duration-700 animate-in fade-in slide-in-from-bottom-6 backdrop-blur-xl relative z-10`}>
      <div className="flex items-start gap-4">
        <div className={`p-4 rounded-2xl border ${currentColors.iconBox}`}>
          <Icon className={`w-7 h-7 ${currentColors.text}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`text-sm font-black uppercase tracking-wider ${currentColors.title}`}>{alert.title}</h4>
            <Badge variant="success" className="gap-1.5 px-3 py-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-300 shadow-md animate-pulse">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Predictor IA
            </Badge>
          </div>
          <p className="text-sm text-white/50 font-medium leading-relaxed max-w-sm mb-5 pr-4">
            {alert.description}
          </p>
          <button className={`group text-[11px] font-black uppercase ${currentColors.text} flex items-center gap-2 hover:translate-x-1 transition-all`}>
             Optimizar Operación <ArrowRight size={14} className="group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
}


