'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Database } from 'lucide-react';

export interface VademecumValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  info: {
    dosis_maxima_legal?: number | null;
    plazo_seguridad_dias?: number | null;
    materia_activa?: string | null;
  };
  source?: 'db' | 'ai';
  loading?: boolean;
}

interface VademecumAlertProps {
  result: VademecumValidationResult | null;
}

export function VademecumAlert({ result }: VademecumAlertProps) {
  if (!result) return null;

  if (result.loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 animate-pulse">
        <div className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
        <span className="text-sm font-bold text-white/50">Verificando en Vademécum...</span>
      </div>
    );
  }

  const { valid, errors, warnings, info, source } = result;
  
  if (valid && errors.length === 0 && warnings.length === 0) {
    return (
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 animate-in slide-in-from-top-2">
        <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold text-emerald-300">Cumple normativa MAPA</p>
          {info.plazo_seguridad_dias && (
            <p className="text-xs text-emerald-400/70 mt-0.5">Plazo de seguridad: {info.plazo_seguridad_dias} días</p>
          )}
        </div>
        {source === 'ai' && <Sparkles size={14} className="text-emerald-500/50" />}
        {source === 'db' && <Database size={14} className="text-emerald-500/50" />}
      </div>
    );
  }

  if (!valid || errors.length > 0) {
    return (
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 animate-in slide-in-from-top-2">
        <ShieldAlert size={18} className="text-red-400 mt-0.5 shrink-0" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-bold text-red-300">Operación No Permitida</p>
          <ul className="list-disc list-inside text-xs text-red-400/80 space-y-0.5">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
        {source === 'ai' && <Sparkles size={14} className="text-red-500/50" />}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-in slide-in-from-top-2">
      <AlertTriangle size={18} className="text-amber-400 mt-0.5 shrink-0" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-bold text-amber-300">Precaución</p>
        <ul className="list-disc list-inside text-xs text-amber-400/80 space-y-0.5">
          {warnings.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      </div>
      {source === 'ai' && <Sparkles size={14} className="text-amber-500/50" />}
    </div>
  );
}
