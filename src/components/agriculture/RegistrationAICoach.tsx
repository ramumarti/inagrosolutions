'use client'

import React, { useState, useEffect } from 'react';
import { Sparkles, X, ChevronRight, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

interface AICoachProps {
  module: 'treatment' | 'fertilization' | 'irrigation';
  currentData: any;
}

export function RegistrationAICoach({ module, currentData }: AICoachProps) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  // SIMULATED IA LOGIC FOR SIEX COMPLIANCE
  useEffect(() => {
    const handleInference = () => {
      // 1. Treatment logic
      if (module === 'treatment') {
        if (!currentData.product && !currentData.parcelId) {
          setSuggestion("Selecciona una parcela para que analice el riesgo climático y sugiera el tratamiento óptimo.");
        } else if (currentData.product?.toLowerCase().includes('cobre')) {
          setSuggestion("El cobre requiere una dosificación máxima de 4kg/ha/año en olivar tradicional según normativa 2026. Asegúrate de no excederla.");
        } else if (currentData.pest?.toLowerCase().includes('mosca')) {
          setSuggestion("La red de alerta detecta un 12% de picada en tu zona. El tratamiento con Deltametrina es lo más efectivo ahora.");
        }
      }

      // 2. Fertilization logic
      if (module === 'fertilization') {
        if (currentData.type === 'mineral') {
           setSuggestion("Para abonados minerales, recuerda que el SIEX exige registrar el Número de Lote del fabricante si la cantidad supera los 100kg.");
        } else {
           setSuggestion("Los abonos orgánicos tienen restricciones de aplicación cerca de cauces de agua (mínimo 50m).");
        }
      }

      // 3. Irrigation logic
      if (module === 'irrigation') {
        if (currentData.volume > 500) {
           setSuggestion("Este volumen excede el consumo medio mensual de tu parcela SIGPAC. ¿Has verificado posibles fugas en el sector?");
        } else {
           setSuggestion("Tu parcela tiene previsión de lluvia en 48h. Podrías reducir el riego a la mitad para ahorrar agua.");
        }
      }
    };

    const timer = setTimeout(handleInference, 1500);
    return () => clearTimeout(timer);
  }, [module, currentData]);

  if (!isVisible || !suggestion) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/20 border border-white/10 p-6 rounded-[32px] backdrop-blur-3xl shadow-2xl animate-in slide-in-from-right-10 duration-700 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
         <Sparkles size={80} />
      </div>

      <div className="flex items-start gap-5 relative z-10">
        <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
           <Sparkles size={24} className="animate-pulse" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Asistente IA Inagro</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          
          <h4 className="text-sm font-black text-white/90 leading-tight mb-2">Consejo Técnico SIEX</h4>
          <p className="text-xs text-white/60 font-medium leading-relaxed leading-relaxed">
            {suggestion}
          </p>
          
          <div className="mt-4 flex gap-3">
             <button className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-all flex items-center gap-1 group">
               Aplicar Dosis Sugerida <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="p-1.5 hover:bg-white/5 rounded-lg text-white/10 hover:text-white/40 transition-all"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
