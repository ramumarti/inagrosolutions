"use client";

import React, { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Tractor, 
  Search, 
  Calendar, 
  MapPin, 
  ChevronRight,
  Filter
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { GlowButton } from "@/components/ui/GlowButton";

interface Labor {
  id: string;
  fecha: string;
  tipo_labor: string;
  descripcion: string;
  superficie_afectada: number;
  parcela: {
    nombre: string;
  };
}

export default function LaboresListPage() {
  const router = useRouter();
  const supabase = createClient();
  const [labores, setLabores] = useState<Labor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLabores() {
      const { data, error } = await supabase
        .from('labores')
        .select(`
          id,
          fecha,
          tipo_labor,
          descripcion,
          superficie_afectada,
          parcela:parcelas(nombre)
        `)
        .order('fecha', { ascending: false });

      if (!error && data) {
        setLabores(data as any);
      }
      setLoading(false);
    }
    fetchLabores();
  }, [supabase]);

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      poda: "Poda y Formación",
      desbroce: "Desbroce / Desvaretado",
      labrado: "Labrado / Arado",
      picado: "Picado de Restos",
      rastreado: "Rastreado / Grada",
      recogida: "Recogida de Fruto",
      otros: "Otros Trabajos"
    };
    return labels[tipo] || tipo;
  };

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      poda: "✂️",
      desbroce: "🚜",
      labrado: "🌾",
      picado: "🪵",
      rastreado: "🚜",
      recogida: "🌱",
      otros: "📋"
    };
    return icons[tipo] || "📋";
  };

  return (
    <div className="max-w-lg mx-auto pb-32 px-4 sm:px-0 relative z-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/cuaderno')}
            className="p-2.5 bg-white/5 rounded-2xl text-white/70 hover:bg-white/10 shadow-sm border border-white/10 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Historial Labores</h1>
        </div>
        <Link href="/cuaderno/labores/nuevo">
          <button className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-90">
            <Plus size={22} />
          </button>
        </Link>
      </div>

      {/* Quick Filter / Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
        <input 
          type="text" 
          placeholder="Buscar labor o parcela..."
          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-[24px] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 font-medium text-white text-sm"
        />
        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/5 rounded-xl border border-white/10 text-white/40 hover:text-white transition-all">
          <Filter size={16} />
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white/5 rounded-[32px] animate-pulse border border-white/10" />
          ))
        ) : labores.length === 0 ? (
          <GlassCard className="p-12 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20 mb-2">
              <Tractor size={32} />
            </div>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">No hay labores registradas</p>
            <Link href="/cuaderno/labores/nuevo">
              <GlowButton variant="primary" className="text-[10px] py-3 px-6 uppercase tracking-widest font-black">
                Registrar primera labor
              </GlowButton>
            </Link>
          </GlassCard>
        ) : (
          labores.map((labor) => (
            <div 
              key={labor.id}
              className="bg-white/5 hover:bg-white/[0.08] p-5 rounded-[32px] border border-white/10 transition-all group flex items-center justify-between cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/5 group-hover:scale-110 transition-transform">
                  {getTipoIcon(labor.tipo_labor)}
                </div>
                <div>
                  <h3 className="font-black text-white text-base leading-tight mb-1">{getTipoLabel(labor.tipo_labor)}</h3>
                  <div className="flex items-center gap-3 text-white/30 text-[10px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <MapPin size={10} className="text-emerald-500" />
                      {labor.parcela?.nombre || 'General'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={10} className="text-blue-400" />
                      {new Date(labor.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-white/20 group-hover:text-white transition-colors pr-1">
                <ChevronRight size={20} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
