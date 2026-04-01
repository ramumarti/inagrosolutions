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
    <div className="max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Nueva Fertilización</h1>
          <p className="text-white/40 text-xs">Registro obligatorio del plan de abonado.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <GlassCard className="p-8 border border-white/5 space-y-6">
          
          <div className="space-y-4">
            {/* Parcela */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                <Sprout className="w-3 h-3" /> Parcela
              </label>
              <select
                value={form.parcela_id}
                onChange={e => setForm({...form, parcela_id: e.target.value})}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium appearance-none"
              >
                {parcelas.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Fecha</label>
              <input
                type="date"
                value={form.fecha}
                onChange={e => setForm({...form, fecha: e.target.value})}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>

            {/* Tipo Abono */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                <Beaker className="w-3 h-3" /> Tipo de Abono / Fertilizante
              </label>
              <input
                value={form.tipo_abono}
                onChange={e => setForm({...form, tipo_abono: e.target.value})}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
                placeholder="Ej: NPK 15-15-15, Purines, Estiércol..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Dosis */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Dosis</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.dosis}
                  onChange={e => setForm({...form, dosis: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                  placeholder="0.00"
                />
              </div>

              {/* Unidad */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Unidad</label>
                <select
                  value={form.unidad_dosis}
                  onChange={e => setForm({...form, unidad_dosis: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                >
                  <option value="kg/ha">kg / ha</option>
                  <option value="L/ha">L / ha</option>
                  <option value="kg/árbol">kg / árbol</option>
                  <option value="m3/ha">m³ / ha</option>
                </select>
              </div>
            </div>

            {/* N-P-K (Riqueza) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Riqueza N-P-K <span className="text-white/20">(Opcional)</span></label>
              <input
                value={form.n_p_k}
                onChange={e => setForm({...form, n_p_k: e.target.value})}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
                placeholder="Ej: 8-24-8"
              />
            </div>
          </div>

          <div className="pt-4">
            <GlowButton 
              variant="primary" 
              className="w-full py-4 text-sm font-black uppercase tracking-widest"
              isLoading={saving}
              disabled={!form.tipo_abono || !form.dosis}
            >
              <Save className="w-4 h-4 mr-2" /> Guardar Fertilización
            </GlowButton>
          </div>
        </GlassCard>
      </form>
    </div>
  );
}
