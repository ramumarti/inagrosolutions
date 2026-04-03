'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { createClient } from '@/lib/supabase/client';
import { Package, Plus, MapPin, Calendar, Weight, Truck, ChevronDown } from 'lucide-react';

interface TrazabilidadModuleProps {
  explotacionId: string;
  parcelas: any[];
}

export function TrazabilidadModule({ explotacionId, parcelas }: TrazabilidadModuleProps) {
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const supabase = createClient();

  const [form, setForm] = useState({
    parcela_id: '',
    lote: '',
    fecha_cosecha: new Date().toISOString().split('T')[0],
    cantidad_kg: '',
    destino_comercial: '',
  });

  const loadRegistros = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('trazabilidad')
        .select('*, parcelas!inner(nombre, explotacion_id)')
        .eq('parcelas.explotacion_id', explotacionId)
        .order('fecha_cosecha', { ascending: false });
      
      setRegistros(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [explotacionId, supabase]);

  useEffect(() => {
    loadRegistros();
  }, [loadRegistros]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.parcela_id || !form.lote) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('trazabilidad').insert({
        parcela_id: form.parcela_id,
        lote: form.lote,
        fecha_cosecha: new Date(form.fecha_cosecha).toISOString(),
        cantidad_kg: Number(form.cantidad_kg) || null,
        destino_comercial: form.destino_comercial || null,
      });
      if (error) throw error;
      
      setIsAdding(false);
      setForm({ ...form, lote: '', cantidad_kg: '', destino_comercial: '' });
      await loadRegistros();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white text-base outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-white/30";
  const labelClass = "text-sm font-bold text-white/80 block mb-2";

  if (isAdding) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 shrink-0 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/10">
              <Package className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Nuevo Lote de Cosecha</h3>
              <p className="text-sm text-white/60 font-bold">Trazabilidad desde el campo</p>
            </div>
          </div>
          <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-3 bg-white/5 rounded-xl text-sm font-bold text-white/80 hover:bg-white/10 hover:text-white transition-colors">
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
            <label className={labelClass}>Código de Lote *</label>
            <input className={inputClass} placeholder="Ej: LOTE-2026-A1" value={form.lote} onChange={e => setForm({...form, lote: e.target.value})} required />
          </div>

          <div>
            <label className={labelClass}>Fecha de Cosecha *</label>
            <input type="date" className={inputClass} value={form.fecha_cosecha} onChange={e => setForm({...form, fecha_cosecha: e.target.value})} required />
          </div>

          <div>
            <label className={labelClass}>Cantidad (kg)</label>
            <input type="number" className={inputClass} placeholder="0" value={form.cantidad_kg} onChange={e => setForm({...form, cantidad_kg: e.target.value})} />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Destino Comercial / Almazara</label>
            <input className={inputClass} placeholder="Cliente, cooperativa o punto de entrega" value={form.destino_comercial} onChange={e => setForm({...form, destino_comercial: e.target.value})} />
          </div>
        </div>

        <GlowButton type="submit" variant="primary" className="w-full py-5 rounded-2xl text-base font-bold" isLoading={loading}>
          Generar Trazabilidad
        </GlowButton>
      </form>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 shrink-0 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/10">
            <Package className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Cosechas y Trazabilidad</h3>
            <p className="text-sm text-white/60 font-bold">Seguimiento de Lotes y Producción</p>
          </div>
        </div>
        <GlowButton variant="secondary" className="px-5 py-4 w-full sm:w-auto text-base font-bold flex items-center justify-center gap-2" onClick={() => setIsAdding(true)}>
          <Plus size={20} /> Registrar Cosecha
        </GlowButton>
      </div>

      {loading ? (
        <div className="p-12 text-center text-white/40 animate-pulse">Cargando registros...</div>
      ) : registros.length === 0 ? (
        <GlassCard className="p-12 text-center border-white/5">
          <Package className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <h4 className="text-sm font-black text-white mb-1">Cosecha vacía</h4>
          <p className="text-xs text-white/30 mb-6">Inicia la campaña registrando el primer lote o entrega.</p>
          <GlowButton variant="secondary" className="px-6 py-2.5 mx-auto text-[10px]" onClick={() => setIsAdding(true)}>
            Nuevo Registro
          </GlowButton>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {registros.map(r => (
            <GlassCard key={r.id} className="p-6 border-white/5 hover:bg-white/[0.02] transition-colors relative group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">LOTE</div>
                  <h4 className="font-black text-white text-lg tracking-tight">{r.lote}</h4>
                </div>
                {r.cantidad_kg > 0 && (
                  <div className="flex justify-center items-center px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-xs font-black text-white">{r.cantidad_kg.toLocaleString()} <span className="text-white/40">kg</span></span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                <p className="text-[11px] text-white/60 font-bold flex items-center gap-2">
                  <MapPin size={12} className="text-white/20" /> Origen: {r.parcelas.nombre}
                </p>
                <p className="text-[11px] text-white/60 font-bold flex items-center gap-2">
                  <Calendar size={12} className="text-white/20" /> {new Date(r.fecha_cosecha).toLocaleDateString()}
                </p>
                {r.destino_comercial && (
                  <p className="text-[11px] text-white/60 font-bold flex items-center gap-2 pt-1">
                    <Truck size={12} className="text-white/20" /> Destino: {r.destino_comercial}
                  </p>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
