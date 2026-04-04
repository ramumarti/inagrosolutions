'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { useAgriProfile } from '@/hooks/useAgriProfile';
import { TIER_CONFIG, TIER_ORDER } from '@/lib/modules';
import type { AgriTier } from '@/lib/modules';
import { Check, X, Crown, Zap, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createCheckoutSession } from '@/lib/actions/stripe';

export default function CuadernoPlanes() {
  const { profile, modulos, loading } = useAgriProfile();
  const [checkingOut, setCheckingOut] = React.useState<AgriTier | null>(null);
  const [interval, setInterval] = React.useState<'month' | 'year'>('month');

  const handleUpgrade = async (tier: AgriTier) => {
    try {
      setCheckingOut(tier);
      const { url } = await createCheckoutSession(tier, interval);
      if (url) window.location.href = url;
    } catch (e: any) {
      console.error(e);
      alert('Error iniciando el pago: ' + e.message);
      setCheckingOut(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const tiers: AgriTier[] = ['basico', 'intermedio', 'avanzado', 'premium'];

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 overflow-y-auto pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <Link href="/cuaderno" className="inline-flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-white/60 transition-colors mb-6">
            <ArrowLeft size={12} /> Volver al Cuaderno
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Planes del Cuaderno Digital</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">Escoge el plan para tu explotación</h1>
          <p className="text-white/30 mt-2 text-sm">Todos los módulos obligatorios incluidos. Ahorra 2 meses con el pago anual.</p>
        </div>

        {/* Toggle Interval */}
        <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
          <button 
            onClick={() => setInterval('month')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${interval === 'month' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white/60'}`}
          >
            Mensual
          </button>
          <button 
            onClick={() => setInterval('year')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${interval === 'year' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white/60'}`}
          >
            Anual <span className="px-2 py-0.5 bg-emerald-400/20 text-emerald-400 text-[8px] rounded-md tracking-tighter">-2 MESES</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => {
          const info = TIER_CONFIG[tier];
          const isCurrent = profile?.tier === tier;
          
          const displayPrice = interval === 'month' ? info.price_monthly : info.price_annual;

          return (
            <GlassCard
              key={tier}
              className={`p-8 flex flex-col relative overflow-hidden transition-all ${
                isCurrent
                  ? 'border-emerald-500/30 bg-emerald-500/5 ring-1 ring-emerald-500/20'
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              {isCurrent && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Actual</span>
                </div>
              )}

              {tier === 'premium' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
              )}

              <div className="mb-8">
                <div className={`w-12 h-12 bg-gradient-to-br ${info.gradient} rounded-xl flex items-center justify-center text-white font-black mb-4 shadow-lg`}>
                  {tier === 'premium' ? <Crown size={20} /> : <Zap size={20} />}
                </div>
                <h3 className="text-xl font-black text-white mb-1">{info.label_es}</h3>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                  Hasta {info.max_ha} ha
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{displayPrice.toString().replace('.', ',')} €</span>
                  <span className="text-xs text-white/20 font-bold">/{interval === 'month' ? 'mes' : 'año'}</span>
                </div>
                {interval === 'year' && (
                  <p className="text-[9px] font-black text-emerald-400 mt-1 uppercase tracking-tighter">Ahorro de {(info.price_monthly * 2).toFixed(2)} €</p>
                )}
              </div>

              <div className="flex-1 space-y-3 mb-8">
                {modulos.map(m => {
                  const included = m.es_obligatorio || TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf(m.tier_minimo as AgriTier);
                  return (
                    <div key={m.slug} className="flex items-center gap-2">
                      {included ? (
                        <Check size={14} className="text-emerald-400 shrink-0" />
                      ) : (
                        <X size={14} className="text-white/10 shrink-0" />
                      )}
                      <span className={`text-[11px] font-bold ${included ? 'text-white/60' : 'text-white/15'}`}>
                        {m.nombre_es}
                      </span>
                      {m.es_obligatorio && included && (
                        <span className="text-[7px] font-black text-emerald-400/50 uppercase tracking-widest ml-auto">Legal</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <GlowButton
                variant={isCurrent ? 'secondary' : 'primary'}
                className="w-full py-4 rounded-xl text-[10px]"
                disabled={isCurrent || checkingOut !== null}
                onClick={() => !isCurrent && handleUpgrade(tier)}
              >
                {checkingOut === tier ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Conectando...</span>
                ) : isCurrent ? 'Plan Actual' : `Seleccionar ${info.label_es}`}
              </GlowButton>
            </GlassCard>
          );
        })}
      </div>

      {/* FAQ */}
      <GlassCard className="p-12 border-white/5">
        <h3 className="text-2xl font-black text-white mb-10 uppercase tracking-tighter">Preguntas Frecuentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {[
            { q: '¿Puedo cambiar de plan en cualquier momento?', a: 'Sí, puedes mejorar o reducir tu plan sin perder datos registrados. Los cambios se aplicarán de forma inmediata en tu próximo ciclo de facturación.' },
            { q: '¿Los módulos obligatorios están incluidos en el plan básico?', a: 'Sí. Todos los registros legales requeridos por el SIEX (Fitosanitarios, Fertilización, Labores) están disponibles en todos los niveles, incluyendo el Básico.' },
            { q: '¿Qué pasa si supero las hectáreas de mi plan?', a: 'Recibirás una notificación invitándote a actualizar al plan que mejor se adapte a tu nueva superficie. Tus datos seguirán seguros y accesibles en todo momento.' },
            { q: '¿Puedo contratar módulos adicionales sin cambiar de plan?', a: '¡Claro! Si necesitas herramientas específicas como el Control de Costes o la integración con Sensores IoT, puedes añadirlos individualmente a cualquier plan.' },
          ].map((faq, i) => (
            <div key={i} className="space-y-3">
              <p className="text-lg font-black text-white leading-tight">{faq.q}</p>
              <p className="text-sm text-white/60 leading-relaxed font-medium">{faq.a}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
