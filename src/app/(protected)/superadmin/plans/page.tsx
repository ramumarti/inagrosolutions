'use client';

import React, { useEffect, useState } from 'react';
import { getGlobalPlans, updatePlan } from '@/lib/actions/superadmin';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { CreditCard, Save, RefreshCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SuperadminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getGlobalPlans();
    setPlans(data);
    setLoading(false);
  }

  const handleUpdate = async (id: string, updates: any) => {
    setSavingId(id);
    const res = await updatePlan(id, updates);
    if (!res.success) alert(res.error);
    else await load();
    setSavingId(null);
  };

  if (loading) return <div className="p-8 text-white/50 animate-pulse font-bold">Cargando planes del sistema...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-4xl font-black glow-text flex items-center gap-3">
            <CreditCard className="w-10 h-10 text-emerald-400" />
            Configuración de Planes
          </h1>
          <p className="text-white/60 font-medium italic">Vinculación de Stripe y control de precios global</p>
        </div>
        <button onClick={load} className="p-2 hover:bg-white/5 rounded-lg text-white/40"><RefreshCcw size={20} /></button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {plans.map((plan) => (
          <GlassCard key={plan.id} className="p-6 border-white/5 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/4">
               <div className={cn(
                 "w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl mb-4 text-white shadow-xl bg-gradient-to-br",
                 plan.slug === 'basico' ? 'from-zinc-500 to-zinc-800' :
                 plan.slug === 'intermedio' ? 'from-blue-500 to-blue-800' :
                 plan.slug === 'avanzado' ? 'from-indigo-500 to-indigo-800' :
                 'from-emerald-500 to-emerald-800'
               )}>
                 {plan.name_es?.[0]}
               </div>
               <h3 className="text-xl font-black text-white">{plan.name_es}</h3>
               <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Slug: {plan.slug}</p>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Precio Mensual (€)</label>
                  <input 
                    type="number"
                    defaultValue={plan.price_monthly}
                    onBlur={(e) => handleUpdate(plan.id, { price_monthly: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Precio Anual (€)</label>
                  <input 
                    type="number"
                    defaultValue={plan.price_annual}
                    onBlur={(e) => handleUpdate(plan.id, { price_annual: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Stripe Price ID</label>
                  <input 
                    defaultValue={plan.stripe_price_id}
                    onBlur={(e) => handleUpdate(plan.id, { stripe_price_id: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-[10px] font-mono text-emerald-400 outline-none focus:border-emerald-500/50"
                  />
               </div>
            </div>

            <div className="w-full md:w-auto flex items-center h-full pt-4 md:pt-0">
               {savingId === plan.id ? (
                 <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
               ) : (
                 <span className="text-[10px] text-white/20 italic">Se guarda al perder el foco</span>
               )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
