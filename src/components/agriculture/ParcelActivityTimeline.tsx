"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Tractor, Droplet, Beaker, ClipboardList, 
  Calendar, MapPin, ChevronRight, Loader2 
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Activity {
  id: string;
  type: 'labor' | 'fitosanitario' | 'fertilizacion';
  date: string;
  title: string;
  description: string;
  parcelName: string;
}

export function ParcelActivityTimeline({ parcelId }: { parcelId?: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadActivities() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get user exploitations
      const { data: exps } = await supabase.from('explotaciones').select('id').eq('user_id', user.id);
      if (!exps || exps.length === 0) {
        setLoading(false);
        return;
      }

      const expIds = exps.map(e => e.id);

      // 2. Load all activities from different tables
      // Labores
      const laborsReq = supabase.from('labores').select(`*, parcelas(nombre, explotacion_id)`).in('parcelas.explotacion_id', expIds);
      // Fitosanitarios
      const fitoReq = supabase.from('tratamientos_fitosanitarios').select(`*, parcelas(nombre, explotacion_id)`).in('parcelas.explotacion_id', expIds);
      // Fertilizaciones
      const fertReq = supabase.from('fertilizaciones').select(`*, parcelas(nombre, explotacion_id)`).in('parcelas.explotacion_id', expIds);

      const [labors, fitos, ferts] = await Promise.all([laborsReq, fitoReq, fertReq]);

      const all: Activity[] = [
        ...(labors.data || []).map(l => ({
          id: l.id,
          type: 'labor' as const,
          date: l.fecha,
          title: l.tipo_labor,
          description: l.descripcion || 'Sin descripción',
          parcelName: l.parcelas?.nombre || 'General'
        })),
        ...(fitos.data || []).map(f => ({
          id: f.id,
          type: 'fitosanitario' as const,
          date: f.fecha,
          title: `Tratamiento: ${f.nombre_producto}`,
          description: `${f.dosis} ${f.unidad_dosis} • Reg: ${f.producto_mapa_id}`,
          parcelName: f.parcelas?.nombre || 'General'
        })),
        ...(ferts.data || []).map(fe => ({
          id: fe.id,
          type: 'fertilizacion' as const,
          date: fe.fecha,
          title: `Fertilización: ${fe.tipo_abono}`,
          description: `${fe.dosis} ${fe.unidad_dosis} ${fe.n_p_k ? '• ' + fe.n_p_k : ''}`,
          parcelName: fe.parcelas?.nombre || 'General'
        }))
      ];

      // Sort and filter by parcelId if provided
      const filtered = (parcelId ? all.filter(a => (a as any).parcela_id === parcelId) : all)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setActivities(filtered);
      setLoading(false);
    }

    loadActivities();
  }, [supabase, parcelId]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-12 text-center text-white/30 border-2 border-dashed border-white/5 rounded-3xl">
        <ClipboardList className="w-8 h-8 mx-auto mb-3 opacity-20" />
        <p className="text-xs uppercase tracking-widest font-bold">Sin actividad registrada aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" /> Historial de la Explotación
        </h3>
        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{activities.length} Eventos</span>
      </div>

      <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-gradient-to-b before:from-emerald-500/50 before:via-white/5 before:to-transparent">
        {activities.map((a, i) => {
          const Icon = a.type === 'labor' ? Tractor : a.type === 'fitosanitario' ? Beaker : Droplet;
          const colorClass = a.type === 'labor' ? 'text-emerald-400 bg-emerald-500/20' : a.type === 'fitosanitario' ? 'text-amber-400 bg-amber-500/20' : 'text-blue-400 bg-blue-500/20';

          return (
            <div key={a.id} className="relative animate-in slide-in-from-left-2 fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              {/* Dot */}
              <div className={`absolute -left-8 top-1.5 w-4 h-4 rounded-full border-2 border-[var(--color-base-100)] z-10 ${colorClass.split(' ')[1]}`} />
              
              <div className="group bg-white/[0.02] border border-white/5 p-5 rounded-2xl hover:bg-white/[0.04] hover:border-emerald-500/20 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className={`p-2.5 rounded-xl h-fit ${colorClass}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                          {format(new Date(a.date), "dd MMM, yyyy", { locale: es })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                          <MapPin size={10} /> {a.parcelName}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-2 leading-snug">{a.title}</h4>
                      <p className="text-xs text-white/40 leading-relaxed max-w-sm">{a.description}</p>
                    </div>
                  </div>
                  <button className="text-white/20 group-hover:text-emerald-400 transition-colors p-2 self-center">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
