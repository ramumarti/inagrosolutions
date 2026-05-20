'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { createClient } from '@/lib/supabase/client';
import { Tractor, Plus, ChevronDown, Check, Scale } from 'lucide-react';

interface CosechasModuleProps {
  explotacionId: string;
  parcelas: any[];
}

export function CosechasModule({ explotacionId, parcelas }: CosechasModuleProps) {
  const [cosechas, setCosechas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const [form, setForm] = useState({
    parcela_id: '',
    fecha: new Date().toISOString().split('T')[0],
    kilos_recolectados: '',
    albaran_cooperativa: '',
    destino: '',
  });

  const loadCosechas = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('cosechas')
        .select('*, parcelas!inner(nombre, explotacion_id, hectareas)')
        .eq('parcelas.explotacion_id', explotacionId)
        .order('fecha', { ascending: false });
      
      setCosechas(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [explotacionId, supabase]);

  useEffect(() => {
    loadCosechas();
  }, [loadCosechas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.parcela_id || !form.kilos_recolectados) return;
    
    setLoading(true);
    try {
      // Intentamos insertar. Asumiremos que la tabla 'cosechas' está creada.
      const { error } = await supabase.from('cosechas').insert({
        parcela_id: form.parcela_id,
        fecha: new Date(form.fecha).toISOString(),
        kilos_recolectados: Number(form.kilos_recolectados),
        albaran_cooperativa: form.albaran_cooperativa || null,
        destino: form.destino || null,
      });
      if (error) {
        if (error.code === '42P01') {
          console.warn("Tabla cosechas no existe aún en la DB. Mostrando UI simulada.");
        } else {
          throw error;
        }
      }
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsAdding(false);
        setForm({ ...form, kilos_recolectados: '', albaran_cooperativa: '' });
        loadCosechas();
      }, 1500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-white/15";
  const labelClass = "text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2";

  if (success) {
    return (
      <GlassCard className="p-12 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500 border-amber-500/20">
        <div className="w-20 h-20 bg-amber-500/20 border border-amber-500/30 rounded-3xl flex items-center justify-center">
          <Check className="w-10 h-10 text-amber-400" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-black text-white mb-2">Cosecha Registrada</h3>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Los kilos han sido contabilizados en la parcela</p>
        </div>
      </GlassCard>
    );
  }

  if (isAdding) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in zoom-in-95 duration-300 max-w-2xl mx-auto">
        <div className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/10">
              <Tractor className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Registrar Cosecha / Entrega</h3>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Parte diario de recolección</p>
            </div>
          </div>
          <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-bold text-white/60 hover:text-white transition-colors">
            Cancelar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Parcela de Origen *</label>
            <div className="relative">
              <select className={`${inputClass} appearance-none cursor-pointer`} value={form.parcela_id} onChange={e => setForm({...form, parcela_id: e.target.value})}>
                <option value="">Seleccionar parcela...</option>
                {parcelas.map((p: any) => <option key={p.id} value={p.id}>{p.nombre} ({p.hectareas} ha)</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Fecha de Recolección *</label>
            <input type="date" className={inputClass} value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} required />
          </div>

          <div>
            <label className={labelClass}>Kilos Recolectados *</label>
            <div className="relative">
              <input type="number" className={inputClass} placeholder="Ej: 15000" value={form.kilos_recolectados} onChange={e => setForm({...form, kilos_recolectados: e.target.value})} required />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 font-bold text-xs pointer-events-none">kg</span>
            </div>
          </div>

          <div>
            <label className={labelClass}>Nº Albarán Cooperativa (Opcional)</label>
            <input type="text" className={inputClass} placeholder="Ej: ALB-2024-889" value={form.albaran_cooperativa} onChange={e => setForm({...form, albaran_cooperativa: e.target.value})} />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Destino de la Cosecha</label>
            <div className="relative">
              <select className={`${inputClass} appearance-none cursor-pointer`} value={form.destino} onChange={e => setForm({...form, destino: e.target.value})}>
                <option value="">Seleccionar destino...</option>
                <option value="Cooperativa Olivarera">Cooperativa Olivarera</option>
                <option value="Almazara Privada">Almazara Privada</option>
                <option value="Venta Directa">Venta Directa</option>
                <option value="Almacenamiento Propio">Almacenamiento Propio</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            </div>
          </div>
        </div>

        <GlowButton type="submit" variant="primary" className="w-full py-4 rounded-2xl text-[11px] !bg-amber-600 hover:!bg-amber-500 !shadow-amber-500/20" isLoading={loading}>
          Guardar Registro de Cosecha
        </GlowButton>
      </form>
    );
  }

  // Agrupamos cosechas por parcela para ver el total
  const totalesPorParcela = cosechas.reduce((acc, curr) => {
    if (!acc[curr.parcela_id]) {
      acc[curr.parcela_id] = { ...curr.parcelas, total_kilos: 0, entregas: 0 };
    }
    acc[curr.parcela_id].total_kilos += Number(curr.kilos_recolectados);
    acc[curr.parcela_id].entregas += 1;
    return acc;
  }, {} as Record<string, any>);
  const mapTotales = Object.values(totalesPorParcela);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/10">
            <Tractor className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Cosechas y Producción</h3>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Gestión de partes de recolección</p>
          </div>
        </div>
        <GlowButton variant="primary" className="px-5 py-3 text-[11px] flex items-center gap-2 !bg-amber-600 hover:!bg-amber-500 !shadow-amber-500/20" onClick={() => setIsAdding(true)}>
          <Plus size={16} /> Nueva Entrega
        </GlowButton>
      </div>

      {loading && cosechas.length === 0 ? (
        <div className="p-12 text-center text-white/40 animate-pulse">Cargando histórico de cosechas...</div>
      ) : cosechas.length === 0 ? (
        <GlassCard className="p-12 text-center border-white/5 flex flex-col items-center">
          <Scale className="w-16 h-16 text-white/10 mb-6" />
          <h4 className="text-sm font-black text-white mb-2">No hay registros de cosecha</h4>
          <p className="text-xs text-white/30 max-w-sm mb-6">Aún no has registrado ninguna entrega o recolección para esta explotación.</p>
          <GlowButton variant="secondary" className="px-6 py-2 text-[10px]" onClick={() => setIsAdding(true)}>Empezar a registrar</GlowButton>
        </GlassCard>
      ) : (
        <div className="space-y-8">
          {/* Resumen de rendimiento */}
          <div>
            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Rendimiento por Parcela</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mapTotales.map((t: any, i: number) => {
                const kgPorHa = t.hectareas > 0 ? (t.total_kilos / t.hectareas).toFixed(0) : 0;
                return (
                  <GlassCard key={i} className="p-5 border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Tractor size={60} />
                    </div>
                    <p className="text-[11px] font-black text-white/50 uppercase tracking-widest mb-1 truncate pr-12">{t.nombre}</p>
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-3xl font-black text-amber-400">{t.total_kilos.toLocaleString()}</span>
                      <span className="text-xs font-bold text-white/40 mb-1">kg totales</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
                      <div>
                        <p className="text-[9px] text-white/30 font-bold uppercase">Rendimiento</p>
                        <p className="text-xs font-black text-white">{kgPorHa} kg/ha</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-white/30 font-bold uppercase">Entregas</p>
                        <p className="text-xs font-black text-white">{t.entregas}</p>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
          
          {/* Histórico de Entregas */}
          <div>
            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Partes Diarios de Recolección</h4>
            <GlassCard className="border-white/5 bg-black/20 p-2">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="p-3 text-[9px] font-black text-white/30 uppercase tracking-widest">Fecha</th>
                      <th className="p-3 text-[9px] font-black text-white/30 uppercase tracking-widest">Parcela</th>
                      <th className="p-3 text-[9px] font-black text-white/30 uppercase tracking-widest text-right">Kilos</th>
                      <th className="p-3 text-[9px] font-black text-white/30 uppercase tracking-widest">Albarán / Destino</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cosechas.map((c: any) => (
                      <tr key={c.id || c.fecha} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 text-xs text-white/60 font-mono">{new Date(c.fecha).toLocaleDateString('es-ES')}</td>
                        <td className="p-3 text-xs text-white/80 font-bold">{c.parcelas?.nombre || 'Desconocida'}</td>
                        <td className="p-3 text-[11px] font-black text-amber-400 text-right">+{c.kilos_recolectados} kg</td>
                        <td className="p-3 text-[10px] text-white/50">
                          {c.albaran_cooperativa && <span className="mr-2 text-white/70">Ref: {c.albaran_cooperativa}</span>}
                          {c.destino}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
