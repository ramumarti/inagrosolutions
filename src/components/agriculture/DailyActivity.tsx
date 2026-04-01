"use client";

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  AlertTriangle, 
  Search, 
  MapPin, 
  Calendar, 
  Tractor, 
  CheckCircle2,
  Sprout,
  Activity
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  fecha: string;
  tipo_labor: string;
  parcela_nombre: string;
}

export function DailyActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadActivity() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Unimos labores con parcelas para obtener el nombre
      const { data } = await supabase
        .from('labores')
        .select(`
          id,
          fecha,
          tipo_labor,
          parcelas (nombre)
        `)
        .order('fecha', { ascending: false })
        .limit(3);

      if (data) {
        setActivities(data.map((l: any) => ({
          id: l.id,
          fecha: l.fecha,
          tipo_labor: l.tipo_labor,
          parcela_nombre: l.parcelas?.nombre || 'Desconocida'
        })));
      }
      setLoading(false);
    }
    loadActivity();
  }, [supabase]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Alertas Fitosanitarias y Legales */}
      <GlassCard className="p-6 border-amber-500/10 bg-amber-500/[0.03] space-y-4">
        <div className="flex items-center gap-3 text-amber-500">
          <AlertTriangle className="w-5 h-5 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          <h3 className="font-bold text-sm uppercase tracking-widest">Alertas PAC / SIEX</h3>
        </div>
        
        <div className="space-y-4 pt-2">
          <div className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
             <div className="w-1.5 h-auto rounded-full bg-amber-500 shrink-0" />
             <div className="flex-1">
                <p className="text-xs text-white/90 font-bold leading-tight">Cierre de Registro Mensual</p>
                <p className="text-[10px] text-white/40 mt-1">Faltan 4 días para subir las labores de Marzo al SIEX.</p>
             </div>
          </div>
          
          <div className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
             <div className="w-1.5 h-auto rounded-full bg-red-500 shrink-0" />
             <div className="flex-1">
                <p className="text-xs text-white/90 font-bold leading-tight">Alerta Mosquilla del Olivo</p>
                <p className="text-[10px] text-white/40 mt-1">Incremento de población detectado en Estepa Norte. Revisar tratamientos.</p>
             </div>
          </div>
        </div>
      </GlassCard>

      {/* Hoy en la Parcela: Actividad Reciente */}
      <GlassCard className="lg:col-span-2 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 text-emerald-400">
             <Activity className="w-5 h-5 stroke-[2.5]" />
             <h3 className="font-bold text-sm uppercase tracking-widest text-white">Actividad Reciente</h3>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-black uppercase tracking-[0.2em]">Explotación Activa</span>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="space-y-3">
               {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)}
            </div>
          ) : activities.length > 0 ? (
            activities.map(act => (
              <div key={act.id} className="group flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.05] transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-600/20 p-2.5 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                    {act.tipo_labor.toLowerCase().includes('abono') ? <Sprout className="w-5 h-5" /> : <Tractor className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors capitalize">{act.tipo_labor}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-white/40">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px] font-medium">{act.parcela_nombre}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-white/60 transition-colors">
                    <Calendar className="w-3 h-3 mr-2" />
                    {new Date(act.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                  </div>
                  <div className="flex items-center text-[9px] text-emerald-500/80 font-bold uppercase">
                     <CheckCircle2 className="w-3 h-3 mr-1" /> Registrado
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center bg-white/[0.01] rounded-3xl border border-dashed border-white/10">
               <p className="text-white/30 text-xs italic">No hay actividad reciente registrada en las parcelas.</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
