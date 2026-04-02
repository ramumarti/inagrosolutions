'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { createClient } from '@/lib/supabase/client';
import { Wallet, TrendingUp, TrendingDown, Plus, ChevronDown, Check } from 'lucide-react';

interface CostesModuleProps {
  explotacionId: string;
  parcelas: any[];
}

export function CostesModule({ explotacionId, parcelas }: CostesModuleProps) {
  const supabase = createClient();
  const [costes, setCostes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    parcela_id: '',
    fecha: new Date().toISOString().split('T')[0],
    concepto: '',
    categoria: 'mano_obra',
    importe: '',
  });

  const categorias = [
    { value: 'mano_obra', label: 'Mano de Obra' },
    { value: 'insumos', label: 'Insumos' },
    { value: 'maquinaria', label: 'Maquinaria' },
    { value: 'riego', label: 'Riego' },
    { value: 'combustible', label: 'Combustible' },
    { value: 'otros', label: 'Otros' },
  ];

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('costes')
        .select('*')
        .eq('explotacion_id', explotacionId)
        .order('fecha', { ascending: false })
        .limit(20);
      setCostes(data || []);
    }
    load();
  }, [explotacionId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.concepto || !form.importe) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('costes').insert({
        explotacion_id: explotacionId,
        parcela_id: form.parcela_id || null,
        fecha: new Date(form.fecha).toISOString(),
        concepto: form.concepto,
        categoria: form.categoria,
        importe: Number(form.importe),
      });
      if (error) throw error;
      setShowForm(false);
      setForm({ parcela_id: '', fecha: new Date().toISOString().split('T')[0], concepto: '', categoria: 'mano_obra', importe: '' });
      // Reload
      const { data } = await supabase.from('costes').select('*').eq('explotacion_id', explotacionId).order('fecha', { ascending: false }).limit(20);
      setCostes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const totalMes = costes
    .filter(c => new Date(c.fecha).getMonth() === new Date().getMonth())
    .reduce((sum, c) => sum + Number(c.importe), 0);

  const totalAnual = costes.reduce((sum, c) => sum + Number(c.importe), 0);

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-white/15";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/10">
            <Wallet className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Control de Costes</h3>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Presupuesto y gastos por parcela</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all">
          <Plus size={18} />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-5 border-white/5">
          <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Gasto Mes</div>
          <div className="text-2xl font-black text-white flex items-baseline gap-1">
            {totalMes.toFixed(2)} <span className="text-xs text-white/20">€</span>
          </div>
        </GlassCard>
        <GlassCard className="p-5 border-white/5">
          <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Gasto Total</div>
          <div className="text-2xl font-black text-white flex items-baseline gap-1">
            {totalAnual.toFixed(2)} <span className="text-xs text-white/20">€</span>
          </div>
        </GlassCard>
      </div>

      {/* New Cost Form */}
      {showForm && (
        <GlassCard className="p-6 border-amber-500/10 animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Concepto *</label>
                <input className={inputClass} placeholder="Ej: Jornalero" value={form.concepto} onChange={e => setForm({...form, concepto: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Importe (€) *</label>
                <input type="number" step="0.01" className={inputClass} placeholder="0.00" value={form.importe} onChange={e => setForm({...form, importe: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Categoría</label>
                <select className={`${inputClass} appearance-none`} value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                  {categorias.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Fecha</label>
                <input type="date" className={inputClass} value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} />
              </div>
            </div>
            <button type="submit" disabled={saving} className="w-full py-3 bg-amber-500/20 border border-amber-500/20 rounded-xl text-[10px] font-black text-amber-400 uppercase tracking-widest hover:bg-amber-500/30 transition-all">
              {saving ? 'Guardando...' : 'Añadir Gasto'}
            </button>
          </form>
        </GlassCard>
      )}

      {/* Cost list */}
      <div className="space-y-2">
        {costes.map(c => (
          <div key={c.id} className="flex items-center justify-between py-3 px-4 bg-white/[0.02] rounded-xl border border-white/5 hover:bg-white/[0.04] transition-all">
            <div>
              <p className="text-sm font-bold text-white">{c.concepto}</p>
              <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                {c.categoria} • {new Date(c.fecha).toLocaleDateString('es-ES')}
              </p>
            </div>
            <span className="text-sm font-black text-amber-400">{Number(c.importe).toFixed(2)} €</span>
          </div>
        ))}
        {costes.length === 0 && (
          <p className="text-center text-xs text-white/20 py-8">Sin gastos registrados</p>
        )}
      </div>
    </div>
  );
}
