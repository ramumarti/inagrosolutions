"use client";

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  FileText
} from 'lucide-react';

export function SiexConnector() {
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const handleSync = () => {
    setStatus('syncing');
    setTimeout(() => {
      setStatus('success');
    }, 2500);
  };

  return (
    <GlassCard className="p-8 border border-emerald-500/20 bg-emerald-500/[0.02] relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Sincronización SIEX</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-emerald-400/60 text-[10px] font-black uppercase tracking-widest">Conexión Activa</p>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-1">Último Envío</p>
            <p className="text-xs text-white/60 font-bold">Hoy, 09:42 AM</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-white/40" />
              <span className="text-sm text-white/80 font-medium">Tratamientos Fitosanitarios</span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-white/40" />
              <span className="text-sm text-white/80 font-medium">Plan de Fertilización 2026</span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl opacity-50">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-white/80 font-medium">Registro de Riegos</span>
            </div>
            <span className="text-[10px] font-black text-amber-400 uppercase">Pendiente</span>
          </div>
        </div>

        <GlowButton 
          variant={status === 'success' ? 'ghost' : 'primary'}
          className="w-full py-4 text-xs font-black uppercase tracking-widest"
          onClick={handleSync}
          disabled={status === 'syncing' || status === 'success'}
        >
          {status === 'idle' && (
            <><Send className="w-4 h-4 mr-2" /> Forzar Sincronización SIEX</>
          )}
          {status === 'syncing' && (
            <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Transfiriendo Datos...</>
          )}
          {status === 'success' && (
            <><CheckCircle2 className="w-4 h-4 mr-2" /> Sincronización Completada</>
          )}
        </GlowButton>

        <p className="text-[9px] text-center text-white/20 mt-4 leading-relaxed">
          Los datos se envían de forma segura al Sistema de Información de Explotaciones Agrarias (SIEX) bajo el protocolo de cifrado AES-256.
        </p>
      </div>
    </GlassCard>
  );
}
