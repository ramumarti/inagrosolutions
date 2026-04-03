'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { createClient } from '@/lib/supabase/client';
import { Calendar, Bug, Leaf, Droplets } from 'lucide-react';

interface CalendarioModuleProps {
  explotacionId: string;
}

export function CalendarioModule({ explotacionId }: CalendarioModuleProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadEvents = useCallback(async () => {
    try {
      const [{ data: tratamientos }, { data: labores }, { data: fertilizaciones }] = await Promise.all([
        supabase.from('tratamientos_fitosanitarios').select('id, fecha, nombre_producto, parcela_id, parcelas!inner(nombre, explotacion_id)').eq('parcelas.explotacion_id', explotacionId),
        supabase.from('labores').select('id, fecha, tipo_labor, parcela_id, parcelas!inner(nombre, explotacion_id)').eq('parcelas.explotacion_id', explotacionId),
        supabase.from('fertilizaciones').select('id, fecha, tipo_abono, parcela_id, parcelas!inner(nombre, explotacion_id)').eq('parcelas.explotacion_id', explotacionId)
      ]);

      const allEvents = [
        ...(tratamientos?.map((t: any) => ({ 
          id: `t_${t.id}`, 
          type: 'tratamiento', 
          date: new Date(t.fecha), 
          title: t.nombre_producto, 
          parcela: t.parcelas.nombre, 
          icon: Bug, 
          color: 'blue' 
        })) || []),
        ...(labores?.map((l: any) => ({ 
          id: `l_${l.id}`, 
          type: 'labor', 
          date: new Date(l.fecha), 
          title: l.tipo_labor, 
          parcela: l.parcelas.nombre, 
          icon: Leaf, 
          color: 'emerald' 
        })) || []),
        ...(fertilizaciones?.map((f: any) => ({ 
          id: `f_${f.id}`, 
          type: 'fertilizacion', 
          date: new Date(f.fecha), 
          title: f.tipo_abono, 
          parcela: f.parcelas.nombre, 
          icon: Droplets, 
          color: 'violet' 
        })) || [])
      ].sort((a, b) => b.date.getTime() - a.date.getTime());

      setEvents(allEvents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [explotacionId, supabase]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sincronizando registros...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 pb-6 border-b border-white/5">
        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/10">
          <Calendar className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Calendario de Actividades</h3>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Línea de tiempo histórica</p>
        </div>
      </div>

      {events.length === 0 ? (
        <GlassCard className="p-12 text-center border-white/5">
          <Calendar className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <h4 className="text-sm font-black text-white mb-1">Sin actividades</h4>
          <p className="text-xs text-white/30">Aún no hay registros de tratamientos, labores o fertilizaciones en esta explotación.</p>
        </GlassCard>
      ) : (
        <div className="relative border-l border-white/10 ml-6 space-y-8 pb-8">
          {events.map((event, index) => {
            const Icon = event.icon;
            return (
              <div key={event.id} className="relative pl-8">
                <div className={`absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-${event.color}-500/20 border border-${event.color}-500/30 flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 text-${event.color}-400`} />
                </div>
                <GlassCard className="p-5 border-white/5 hover:bg-white/[0.02] transition-colors relative group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <h4 className="font-black text-white text-sm tracking-tight">{event.title}</h4>
                    <span className="text-[9px] font-black text-white/40 bg-white/5 px-2 py-1 rounded-md uppercase tracking-widest border border-white/5">
                      {event.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
                    Parcela: <span className="text-white/80">{event.parcela}</span>
                  </p>
                </GlassCard>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
