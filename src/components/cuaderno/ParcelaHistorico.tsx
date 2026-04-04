'use client';

import React, { useEffect, useState } from 'react';
import { 
  X, History, Bug, Leaf, Droplets, 
  ArrowRight, Calendar, User, Tractor, AlertTriangle
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { createClient } from '@/lib/supabase/client';

interface ParcelaHistoricoProps {
  parcelaId: string;
  onClose: () => void;
}

export function ParcelaHistorico({ parcelaId, onClose }: ParcelaHistoricoProps) {
  const [actividades, setActividades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchHistory = async () => {
      // Unificamos actividades de diferentes tablas para el histórico
      const [fito, labores] = await Promise.all([
        supabase.from('tratamientos_fitosanitarios').select('*').eq('parcela_id', parcelaId).order('fecha', { ascending: false }),
        supabase.from('labores_agricolas').select('*').eq('parcela_id', parcelaId).order('fecha', { ascending: false })
      ]);

      const combined = [
        ...(fito.data || []).map(x => ({ ...x, type: 'fitosanitario', icon: Bug, color: 'text-blue-400', bg: 'bg-blue-400/10' })),
        ...(labores.data || []).map(x => ({ ...x, type: 'labor', icon: Leaf, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }))
      ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      setActividades(combined);
      setLoading(false);
    };

    fetchHistory();
  }, [parcelaId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <GlassCard className="max-w-2xl w-full relative p-8 border-white/10 max-h-[85vh] flex flex-col">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex items-center gap-4 mb-8 shrink-0">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-white/40">
            <History size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Historial de Actividades</h3>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Trazabilidad completa de la parcela</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 space-y-4">
          {loading ? (
            <div className="py-20 text-center animate-pulse text-white/20 font-black uppercase tracking-widest text-xs">Cargando cronología...</div>
          ) : actividades.length === 0 ? (
            <div className="py-20 text-center text-white/20 font-black uppercase tracking-widest text-xs italic">No hay actividades registradas en esta campaña</div>
          ) : (
            actividades.map((act, i) => {
              const Icon = act.icon;
              return (
                <div key={i} className="relative pl-8 pb-4 group">
                  {/* Timeline Line */}
                  {i !== actividades.length - 1 && (
                    <div className="absolute left-3 top-8 bottom-0 w-px bg-white/5 group-hover:bg-emerald-500/20 transition-colors" />
                  )}
                  
                  {/* Timeline Dot */}
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-lg ${act.bg} flex items-center justify-center z-10 border border-white/5`}>
                    <Icon size={12} className={act.color} />
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-tighter block mb-1">
                          {new Date(act.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <h4 className="text-sm font-bold text-white capitalize">{act.type === 'fitosanitario' ? act.nombre_producto : act.tipo_labor}</h4>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${act.bg} ${act.color}`}>
                          {act.type}
                        </span>
                        {act.dosis && <span className="text-[10px] font-bold text-white/40">{act.dosis} {act.unidad_dosis}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 opacity-50">
                        {act.maquinaria_usada && (
                            <div className="flex items-center gap-2 text-[10px] text-white">
                                <Tractor size={12} className="text-white/40" /> {act.maquinaria_usada}
                            </div>
                        )}
                        {act.operario && (
                            <div className="flex items-center gap-2 text-[10px] text-white">
                                <User size={12} className="text-white/40" /> {act.operario}
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-6 border-t border-white/5 mt-auto bg-gradient-to-t from-[#0a0a0a] to-transparent">
          <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-all">Ver Informe PDF Completo</button>
        </div>
      </GlassCard>
    </div>
  );
}
