'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { createClient } from '@/lib/supabase/client';
import { Leaf, Check, ChevronDown } from 'lucide-react';

interface LaborFormProps {
  parcelas: any[];
  onSuccess: () => void;
}

const TIPOS_LABOR = [
  'Siembra', 'Riego', 'Poda', 'Cosecha', 'Laboreo',
  'Tratamiento suelo', 'Abonado', 'Control de plagas',
  'Desbroce', 'Recolección', 'Otro'
];

export function LaborForm({ parcelas, onSuccess }: LaborFormProps) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    parcela_id: '',
    fecha: new Date().toISOString().split('T')[0],
    tipo_labor: '',
    descripcion: '',
    superficie_afectada: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.parcela_id || !form.tipo_labor) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('labores').insert({
        parcela_id: form.parcela_id,
        fecha: new Date(form.fecha).toISOString(),
        tipo_labor: form.tipo_labor,
        descripcion: form.descripcion || null,
        superficie_afectada: form.superficie_afectada ? Number(form.superficie_afectada) : null,
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

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-white/15";
  const labelClass = "text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2";

  if (success) {
    return (
      <GlassCard className="p-12 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-3xl flex items-center justify-center">
          <Check className="w-10 h-10 text-emerald-400" />
        </div>
        <h3 className="text-xl font-black text-white">Labor Registrada</h3>
      </GlassCard>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 pb-6 border-b border-white/5">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/10">
          <Leaf className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Nueva Labor Agrícola</h3>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Registro del cuaderno de campo</p>
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
          <label className={labelClass}>Tipo de Labor *</label>
          <div className="relative">
            <select className={`${inputClass} appearance-none cursor-pointer`} value={form.tipo_labor} onChange={e => setForm({...form, tipo_labor: e.target.value})}>
              <option value="">Seleccionar tipo...</option>
              {TIPOS_LABOR.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Superficie (ha)</label>
          <input type="number" step="0.01" className={inputClass} placeholder="0.00" value={form.superficie_afectada} onChange={e => setForm({...form, superficie_afectada: e.target.value})} />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Descripción</label>
          <textarea className={`${inputClass} min-h-[100px] resize-none`} placeholder="Detalles de la labor realizada..." value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} />
        </div>
      </div>

      <GlowButton type="submit" variant="primary" className="w-full py-4 rounded-2xl text-[11px]" isLoading={saving}>
        Registrar Labor
      </GlowButton>
    </form>
  );
}
