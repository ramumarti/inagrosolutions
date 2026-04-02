"use client";

import React, { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Bug, 
  Search, 
  Calendar, 
  MapPin, 
  ChevronRight,
  Filter,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { GlowButton } from "@/components/ui/GlowButton";

interface Plaga {
  id: string;
  fecha: string;
  tipo_plaga: string;
  nivel_infestacion: string;
  medidas_tomadas: string;
  parcela: {
    nombre: string;
  };
}

export default function PlagasListPage() {
  const router = useRouter();
  const supabase = createClient();
  const [plagas, setPlagas] = useState<Plaga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlagas() {
      const { data, error } = await supabase
        .from('plagas')
        .select(`
          id,
          fecha,
          tipo_plaga,
          nivel_infestacion,
          medidas_tomadas,
          parcela:parcelas(nombre)
        `)
        .order('fecha', { ascending: false });

      if (!error && data) {
        setPlagas(data as any);
      }
      setLoading(false);
    }
    fetchPlagas();
  }, [supabase]);

  const getNivelStyle = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'alto': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'medio': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
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
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Control Plagas</h1>
        </div>
        <Link href="/cuaderno/plagas/nuevo">
          <button className="p-3 bg-rose-500 rounded-2xl text-white shadow-lg shadow-rose-500/20 hover:bg-rose-400 transition-all active:scale-90">
            <Plus size={22} />
          </button>
        </Link>
      </div>

      {/* Quick Filter / Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
        <input 
          type="text" 
          placeholder="Buscar plaga o parcela..."
          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-[24px] outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 font-medium text-white text-sm"
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
        ) : plagas.length === 0 ? (
          <GlassCard className="p-12 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20 mb-2">
              <Bug size={32} />
            </div>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">No hay plagas registradas</p>
            <Link href="/cuaderno/plagas/nuevo">
              <GlowButton variant="primary" className="text-[10px] py-3 px-6 uppercase tracking-widest font-black">
                Registrar primer avistamiento
              </GlowButton>
            </Link>
          </GlassCard>
        ) : (
          plagas.map((p) => (
            <div 
              key={p.id}
              className="bg-white/5 hover:bg-white/[0.08] p-5 rounded-[32px] border border-white/10 transition-all group flex items-center justify-between cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400 shadow-inner border border-rose-500/10 group-hover:scale-110 transition-transform">
                  <Bug size={24} />
                </div>
                <div>
                  <h3 className="font-black text-white text-base leading-tight mb-1">{p.tipo_plaga}</h3>
                  <div className="flex items-center gap-3 text-white/30 text-[10px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <MapPin size={10} className="text-emerald-500" />
                      {p.parcela?.nombre || 'General'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={10} className="text-blue-400" />
                      {new Date(p.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end pr-1">
                 <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border mb-1 uppercase tracking-tighter ${getNivelStyle(p.nivel_infestacion)} underline-offset-2 decoration-rose-500/30`}>
                   IA Detect: {p.nivel_infestacion}
                 </span>
                 <ChevronRight size={18} className="text-white/10 group-hover:text-white transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
