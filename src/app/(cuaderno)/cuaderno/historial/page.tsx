"use client";

import React, { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  History, 
  Calendar, 
  MapPin, 
  ChevronRight,
  Filter,
  Tractor,
  Sprout,
  Droplets,
  Bug,
  LineChart,
  Search
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";

interface LogEntry {
  id: string;
  fecha: string;
  tipo: 'labor' | 'tratamiento' | 'riego' | 'plaga' | 'produccion' | 'residuo';
  titulo: string;
  subtitulo: string;
  meta: string;
}

export default function GlobalHistoryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllHistory() {
      setLoading(true);
      
      // Fetch from multiple tables in parallel
      const [laboresRes, tratamientosRes, riegosRes, plagasRes] = await Promise.all([
        supabase.from('labores').select('id, fecha, tipo_labor, parcelas(nombre)').limit(10).order('fecha', { ascending: false }),
        supabase.from('tratamientos_fitosanitarios').select('id, fecha, nombre_producto, parcelas(nombre)').limit(10).order('fecha', { ascending: false }),
        supabase.from('riegos').select('id, fecha, metodo_riego, parcelas(nombre)').limit(10).order('fecha', { ascending: false }),
        supabase.from('plagas').select('id, fecha, tipo_plaga, parcelas(nombre)').limit(10).order('fecha', { ascending: false }),
      ]);

      const combined: LogEntry[] = [];

      if (laboresRes.data) {
        laboresRes.data.forEach(l => combined.push({
          id: l.id,
          fecha: l.fecha,
          tipo: 'labor',
          titulo: l.tipo_labor,
          subtitulo: (l as any).parcelas?.nombre || 'Parcela General',
          meta: 'Labor Cultural'
        }));
      }

      if (tratamientosRes.data) {
        tratamientosRes.data.forEach(t => combined.push({
          id: t.id,
          fecha: t.fecha,
          tipo: 'tratamiento',
          titulo: t.nombre_producto,
          subtitulo: (t as any).parcelas?.nombre || 'Parcela General',
          meta: 'Fitosanitario'
        }));
      }

      if (riegosRes.data) {
        riegosRes.data.forEach(r => combined.push({
          id: r.id,
          fecha: r.fecha,
          tipo: 'riego',
          titulo: r.metodo_riego || 'Riego por Goteo',
          subtitulo: (r as any).parcelas?.nombre || 'Parcela General',
          meta: 'Hidratación'
        }));
      }

      if (plagasRes.data) {
        plagasRes.data.forEach(p => combined.push({
          id: p.id,
          fecha: p.fecha,
          tipo: 'plaga',
          titulo: p.tipo_plaga,
          subtitulo: (p as any).parcelas?.nombre || 'Parcela General',
          meta: 'Control IPM'
        }));
      }

      // Sort by date descending
      combined.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      setLogs(combined);
      setLoading(false);
    }

    fetchAllHistory();
  }, [supabase]);

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'labor': return <Tractor size={20} className="text-amber-400" />;
      case 'tratamiento': return <Sprout size={20} className="text-emerald-400" />;
      case 'riego': return <Droplets size={20} className="text-blue-400" />;
      case 'plaga': return <Bug size={20} className="text-rose-400" />;
      default: return <History size={20} className="text-white/40" />;
    }
  };

  const getBg = (tipo: string) => {
    switch (tipo) {
      case 'labor': return 'bg-amber-500/10 border-amber-500/10';
      case 'tratamiento': return 'bg-emerald-500/10 border-emerald-500/10';
      case 'riego': return 'bg-blue-500/10 border-blue-500/10';
      case 'plaga': return 'bg-rose-500/10 border-rose-500/10';
      default: return 'bg-white/5 border-white/10';
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-32 px-4 sm:px-0 relative z-10 animate-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/cuaderno')}
            className="p-2.5 bg-white/5 rounded-2xl text-white/70 hover:bg-white/10 shadow-sm border border-white/10 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Cronograma SIEX</h1>
        </div>
        <button className="p-3 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
          <LineChart size={22} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 p-4 rounded-[28px] border border-white/5">
           <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Total Actividades</p>
           <p className="text-2xl font-black text-white">{logs.length}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-[28px] border border-white/5">
           <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Últimos 30 días</p>
           <p className="text-2xl font-black text-emerald-400">12</p>
        </div>
      </div>

       {/* Search */}
       <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
        <input 
          type="text" 
          placeholder="Filtrar por actividad o fecha..."
          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-[24px] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 font-medium text-white text-sm"
        />
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-white/5 rounded-[24px] animate-pulse border border-white/10" />
          ))
        ) : logs.length === 0 ? (
          <GlassCard className="p-12 text-center text-white/30 uppercase font-black tracking-widest text-[10px]">
             Sin actividad registrada recientemente
          </GlassCard>
        ) : (
          logs.map((log) => (
            <div 
              key={`${log.tipo}-${log.id}`}
              className="bg-white/5 hover:bg-white/[0.08] p-4 rounded-[28px] border border-white/10 transition-all flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border group-hover:scale-105 transition-transform ${getBg(log.tipo)}`}>
                   {getIcon(log.tipo)}
                </div>
                <div>
                  <h4 className="font-black text-white text-[13px] leading-tight mb-1 line-clamp-1 capitalize">{log.titulo}</h4>
                  <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-white/30">
                    <span className="flex items-center gap-1"><MapPin size={8} className="text-emerald-500" /> {log.subtitulo}</span>
                    <span className="opacity-30">•</span>
                    <span className="flex items-center gap-1"><Calendar size={8} /> {new Date(log.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end pr-1">
                 <Badge variant="neutral" className="bg-white/[0.03] text-white/30 border-white/10 text-[7px] mb-1">{log.meta}</Badge>
                 <ChevronRight size={16} className="text-white/5 group-hover:text-white transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
