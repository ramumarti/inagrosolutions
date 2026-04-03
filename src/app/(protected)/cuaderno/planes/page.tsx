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

  const handleUpgrade = async (tier: AgriTier) => {
    try {
      setCheckingOut(tier);
      const { url } = await createCheckoutSession(tier);
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
      <div>
        <Link href="/cuaderno" className="inline-flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-white/60 transition-colors mb-6">
          <ArrowLeft size={12} /> Volver al Cuaderno
        </Link>
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Planes del Cuaderno Digital</span>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">Escoge tu Plan</h1>
        <p className="text-white/30 mt-2 text-sm">Todos los módulos obligatorios incluidos. Desbloquea herramientas avanzadas con un plan superior.</p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => {
          const info = TIER_CONFIG[tier];
          const isCurrent = profile?.tier === tier;
          const tierModulos = modulos.filter(m =>
            m.es_obligatorio || TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf(m.tier_minimo as AgriTier)
          );

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
                  {info.max_ha === Infinity ? 'Más de 100 ha' : `Hasta ${info.max_ha} ha`}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{info.price_monthly === 0 ? 'Gratis' : `${info.price_monthly.toString().replace('.', ',')} €`}</span>
                  {info.price_monthly > 0 && <span className="text-xs text-white/20 font-bold">/mes</span>}
                </div>
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
      <GlassCard className="p-8 border-white/5">
        <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight">Preguntas Frecuentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { q: '¿Puedo cambiar de plan en cualquier momento?', a: 'Sí, puedes mejorar o reducir tu plan sin perder datos registrados.' },
            { q: '¿Los módulos obligatorios están incluidos en el plan básico?', a: 'Los módulos de registro legal (SIEX, fitosanitarios, fertilización, labores) están incluidos en todos los planes.' },
            { q: '¿Qué pasa si supero las hectáreas de mi plan?', a: 'Recibirás una notificación para actualizar al plan correspondiente. Tus datos seguirán accesibles.' },
            { q: '¿Puedo contratar módulos adicionales sin cambiar de plan?', a: 'Sí, los módulos opcionales como Control de Costes o Sensores IoT se pueden contratar individualmente.' },
          ].map((faq, i) => (
            <div key={i}>
              <p className="text-xs font-black text-white mb-1">{faq.q}</p>
              <p className="text-[11px] text-white/30 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
