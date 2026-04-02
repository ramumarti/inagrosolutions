"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Beaker, Sprout, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";

interface Parcela {
  id: string;
  nombre: string;
}

export default function NuevaFertilizacionPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  
  const [form, setForm] = useState({
    parcela_id: "",
    tipo_abono: "",
    dosis: "",
    unidad_dosis: "kg/ha",
    n_p_k: "",
    fecha: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    async function loadParcelas() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: exps } = await supabase
        .from('explotaciones')
        .select('id')
        .eq('user_id', user.id);

      if (exps && exps.length > 0) {
        const { data } = await supabase
          .from('parcelas')
          .select('id, nombre')
          .in('explotacion_id', exps.map(e => e.id));
        
        if (data) {
          setParcelas(data);
          if (data.length > 0) setForm(f => ({ ...f, parcela_id: data[0].id }));
        }
      }
      setLoading(false);
    }
    loadParcelas();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.parcela_id || !form.tipo_abono || !form.dosis) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('fertilizaciones').insert({
        parcela_id: form.parcela_id,
        fecha: new Date(form.fecha).toISOString(),
        tipo_abono: form.tipo_abono,
        dosis: parseFloat(form.dosis),
        unidad_dosis: form.unidad_dosis,
        n_p_k: form.n_p_k || null
      });

      if (error) throw error;
      router.push('/cuaderno');
    } catch (err) {
      console.error(err);
      alert("Error al guardar la fertilización");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-32 relative px-4 sm:px-0 z-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <button 
          onClick={() => router.back()} 
          className="p-2.5 bg-white/5 rounded-2xl text-white/70 hover:bg-white/10 shadow-sm border border-white/10 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Nueva Fertilización</h1>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Plan de Abonado Obligatorio</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
          
          <div className="space-y-6">
            {/* Parcela */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2 pl-1">
                <Sprout className="w-3 h-3 text-white/40" /> Parcela Seleccionada
              </label>
              <div className="relative">
                <select
                  value={form.parcela_id}
                  onChange={e => setForm({...form, parcela_id: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 text-white font-bold text-base focus:outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                >
                  {parcelas.map(p => (
                    <option key={p.id} value={p.id} className="bg-zinc-900">{p.nombre}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                  <ArrowLeft size={16} className="-rotate-90" />
                </div>
              </div>
            </div>

            {/* Fecha */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1 leading-none">Fecha de Aplicación</label>
              <input
                type="date"
                value={form.fecha}
                onChange={e => setForm({...form, fecha: e.target.value})}
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 text-white font-bold text-base focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>

            {/* Tipo Abono */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2 pl-1 leading-none">
                <Beaker className="w-3 h-3 text-white/40" /> Fertilizante (Tipo / Marca)
              </label>
              <input
                value={form.tipo_abono}
                onChange={e => setForm({...form, tipo_abono: e.target.value})}
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 text-white text-base placeholder:text-white/10 focus:outline-none focus:border-emerald-500/50 transition-all font-medium shadow-inner"
                placeholder="Ej: NPK 15-15-15, Purines..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Dosis */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1 leading-none">Dosis</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.dosis}
                  onChange={e => setForm({...form, dosis: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 text-white font-black text-xl shadow-inner focus:outline-none focus:border-emerald-500/50 transition-all"
                  placeholder="0.00"
                />
              </div>

              {/* Unidad */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1 leading-none">Unidad</label>
                <select
                  value={form.unidad_dosis}
                  onChange={e => setForm({...form, unidad_dosis: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 text-white font-bold text-base appearance-none cursor-pointer focus:outline-none focus:border-emerald-500/50 transition-all"
                >
                  <option value="kg/ha" className="bg-zinc-900">kg / ha</option>
                  <option value="L/ha" className="bg-zinc-900">L / ha</option>
                  <option value="kg/árbol" className="bg-zinc-900">kg / ár.</option>
                  <option value="m3/ha" className="bg-zinc-900">m³ / ha</option>
                </select>
              </div>
            </div>

            {/* N-P-K (Riqueza) */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1 leading-none">Riqueza N-P-K <span className="text-white/10 font-bold lowercase">(opcional)</span></label>
              <input
                value={form.n_p_k}
                onChange={e => setForm({...form, n_p_k: e.target.value})}
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 text-white text-base placeholder:text-white/10 focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                placeholder="Ej: 8-24-8"
              />
            </div>
          </div>

          <div className="pt-4">
            <GlowButton 
              variant="primary" 
              className="w-full py-6 text-lg font-black uppercase tracking-[0.15em] rounded-[24px] shadow-2xl shadow-emerald-900/20 active:scale-[0.98] transition-all"
              isLoading={saving}
              disabled={!form.tipo_abono || !form.dosis || !form.parcela_id}
            >
              <Save className="w-5 h-5 mr-3" /> Registrar Abono
            </GlowButton>
          </div>
        </div>
      </form>
    </div>
  );
}
