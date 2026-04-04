'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { createClient } from '@/lib/supabase/client';
import { Droplets, Check, ChevronDown } from 'lucide-react';

interface FertilizacionFormProps {
  parcelas: any[];
  initialParcelaId?: string;
  onSuccess: () => void;
}

export function FertilizacionForm({ parcelas, initialParcelaId, onSuccess }: FertilizacionFormProps) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (initialParcelaId) {
      setForm(prev => ({ ...prev, parcela_id: initialParcelaId }));
    }
  }, [initialParcelaId]);
  const [form, setForm] = useState({
    parcela_id: '',
    fecha: new Date().toISOString().split('T')[0],
    tipo_abono: '',
    dosis: '',
    unidad_dosis: 'kg/ha',
    n_p_k: '',
  });

  const tiposAbono = ['Mineral sólido', 'Mineral líquido', 'Orgánico', 'Organomineral', 'Fertirrigación', 'Foliar'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.parcela_id || !form.tipo_abono || !form.dosis) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('fertilizaciones').insert({
        parcela_id: form.parcela_id,
        fecha: new Date(form.fecha).toISOString(),
        tipo_abono: form.tipo_abono,
        dosis: Number(form.dosis),
        unidad_dosis: form.unidad_dosis,
        n_p_k: form.n_p_k || null,
      });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onSuccess(); }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white text-base outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-white/30";
  const labelClass = "text-sm font-bold text-white/80 block mb-2";

  if (success) {
    return (
      <GlassCard className="p-12 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-violet-500/20 border border-violet-500/30 rounded-3xl flex items-center justify-center">
          <Check className="w-10 h-10 text-violet-400" />
        </div>
        <h3 className="text-xl font-black text-white">Fertilización Registrada</h3>
      </GlassCard>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 pb-6 border-b border-white/5">
        <div className="w-16 h-16 bg-violet-500/10 rounded-xl flex items-center justify-center border border-violet-500/10 shrink-0">
          <Droplets className="w-8 h-8 text-violet-400" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Nueva Fertilización</h3>
          <p className="text-sm text-white/60 font-bold">Registro de abonado • Plan de fertilización</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Parcela *</label>
          <div className="relative">
            <select className={`${inputClass} appearance-none cursor-pointer`} value={form.parcela_id} onChange={e => setForm({...form, parcela_id: e.target.value})}>
              <option value="">Seleccionar...</option>
              {parcelas.map((p: any) => <option key={p.id} value={p.id}>{p.nombre} ({p.hectareas} ha)</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Fecha *</label>
          <input type="date" className={inputClass} value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} />
        </div>

        <div>
          <label className={labelClass}>Tipo de Abono *</label>
          <div className="relative">
            <select className={`${inputClass} appearance-none cursor-pointer`} value={form.tipo_abono} onChange={e => setForm({...form, tipo_abono: e.target.value})}>
              <option value="">Seleccionar tipo...</option>
              {tiposAbono.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Dosis *</label>
            <input type="number" step="0.01" className={inputClass} placeholder="0.00" value={form.dosis} onChange={e => setForm({...form, dosis: e.target.value})} />
          </div>
          <div>
            <label className={labelClass}>Unidad</label>
            <div className="relative">
              <select className={`${inputClass} appearance-none cursor-pointer`} value={form.unidad_dosis} onChange={e => setForm({...form, unidad_dosis: e.target.value})}>
                <option value="kg/ha">kg/ha</option>
                <option value="L/ha">L/ha</option>
                <option value="t/ha">t/ha</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>N-P-K (Riqueza)</label>
          <input className={inputClass} placeholder="Ej: 20-10-5" value={form.n_p_k} onChange={e => setForm({...form, n_p_k: e.target.value})} />
        </div>
      </div>

      <GlowButton type="submit" variant="primary" className="w-full py-5 rounded-2xl text-base font-bold" isLoading={saving}>
        Registrar Fertilización
      </GlowButton>
    </form>
  );
}
