'use client';

import React, { useEffect, useState } from 'react';
import { AgriApiService } from '@/lib/agri-api';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Database, ShieldCheck, FileText, Plus, Activity, CloudRain, Wind, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function CuadernoProPage() {
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [farms, setFarms] = useState<any[]>([]);
  const supabase = createClient();

  const checkConnectivity = async () => {
    setStatus('LOADING');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No Auth');

      // 1. Simular Login en NestJS para obtener Token
      const authRes = await AgriApiService.login(user.email!, 1);
      const token = authRes.token;

      // 2. Probar conectividad con el servicio de Fincas
      const farmsRes = await AgriApiService.getFarms(token);
      setFarms([]); // Simulamos carga vacía inicialmente
      setStatus('SUCCESS');
    } catch (err) {
      console.error(err);
      setStatus('ERROR');
    }
  };

  return (
    <div className="p-12 space-y-12 pb-32 max-w-7xl mx-auto animate-in fade-in duration-700">
      
      {/* Hero Service Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
        <div>
           <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">Microservicio v2.1</span>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">NestJS Enabled</span>
           </div>
           <h1 className="text-5xl font-black text-white tracking-tight uppercase">Cuaderno <span className="text-indigo-500 italic">Digital Pro</span></h1>
           <p className="text-white/30 text-xs font-bold uppercase tracking-[0.3em] mt-2">Módulo Agrario de Alta Precisión • Arquitectura Modular</p>
        </div>
        <GlowButton variant="secondary" onClick={checkConnectivity} isLoading={status === 'LOADING'} className="px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em]">
           {status === 'SUCCESS' ? '📡 Conectado (OK)' : '🔌 Test Conectividad'}
        </GlowButton>
      </div>

      {status === 'ERROR' && (
        <GlassCard className="p-6 border-red-500/30 bg-red-500/5 animate-bounce">
           <p className="text-red-400 text-xs font-black uppercase flex items-center gap-2">
             <AlertCircle size={14} /> El backend NestJS no está respondiendo (Puerto 3001)
           </p>
        </GlassCard>
      )}

      {/* Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         
         <GlassCard className="p-10 border-white/5 flex flex-col items-center text-center group cursor-pointer hover:bg-white/[0.04] transition-all">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 border border-white/10 group-hover:scale-110 transition-all">
               <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Cumplimiento SIEX</h3>
            <p className="text-white/30 text-[10px] leading-relaxed uppercase font-bold tracking-widest">Generación oficial de libros de explotación alineados al Ministerio.</p>
            <div className="mt-8 pt-8 border-t border-white/5 w-full">
               <GlowButton variant="ghost" className="w-full text-[9px] uppercase font-black tracking-widest py-3">Configurar ROPO</GlowButton>
            </div>
         </GlassCard>

         <GlassCard className="p-10 border-white/5 flex flex-col items-center text-center group cursor-pointer hover:bg-white/[0.04] transition-all">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 border border-white/10 group-hover:scale-110 transition-all">
               <Database size={32} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Gestión de Insumos</h3>
            <p className="text-white/30 text-[10px] leading-relaxed uppercase font-bold tracking-widest">Inventario digital y trazabilidad automática de productos fitosanitarios.</p>
            <div className="mt-8 pt-8 border-t border-white/5 w-full">
               <GlowButton variant="ghost" className="w-full text-[9px] uppercase font-black tracking-widest py-3">Registrar Tratamiento</GlowButton>
            </div>
         </GlassCard>

         <GlassCard className="p-10 border-white/5 flex flex-col items-center text-center group cursor-pointer hover:bg-white/[0.04] transition-all">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 border border-white/10 group-hover:scale-110 transition-all">
               <FileText size={32} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Planos SIGPAC</h3>
            <p className="text-white/30 text-[10px] leading-relaxed uppercase font-bold tracking-widest">Importación instantánea de parcelas mediante referencias oficiales.</p>
            <div className="mt-8 pt-8 border-t border-white/5 w-full">
               <GlowButton variant="ghost" className="w-full text-[9px] uppercase font-black tracking-widest py-3">Asociar Parcela</GlowButton>
            </div>
         </GlassCard>

      </div>

      {/* Telemetry Mockup */}
      <GlassCard className="p-12 border-white/5 min-h-[400px] overflow-hidden relative">
         <div className="flex items-center justify-between mb-12">
            <div>
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Telemetría Avanzada</h3>
               <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest leading-none mt-1">Sincronizado vía AgriAPI • Global Cloud Edge</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  <Wind size={14} className="text-white/20" />
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">12 km/h</span>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  <CloudRain size={14} className="text-white/20" />
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">0.4 mm</span>
               </div>
            </div>
         </div>

         {/* Chart Skeleton */}
         <div className="h-64 w-full flex items-end gap-2 px-4 border-l border-b border-white/5">
            {[40, 60, 45, 90, 65, 80, 55, 75, 40, 85, 95, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-indigo-500/30 to-indigo-500 rounded-t-lg transition-all hover:scale-105 cursor-pointer" style={{ height: `${h}%` }} />
            ))}
         </div>
      </GlassCard>

    </div>
  );
}
