"use client";

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { useAgriProfile } from '@/hooks/useAgriProfile';
import { useI18n } from '@/lib/i18n';
import { 
  Wallet, 
  CreditCard, 
  FileText, 
  ShieldCheck,
  TrendingUp,
  Clock,
  ExternalLink,
  Loader2
} from 'lucide-react';

export default function TenantBillingPage() {
  const { tenant, profile } = useAgriProfile();
  const { language } = useI18n();
  const [portalLoading, setPortalLoading] = useState(false);

  const subscriptionStatus = profile?.subscription_status || 'inactive';
  const subscriptionTier = profile?.subscription_tier || 'Sin plan';

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'Activo', color: 'emerald' },
    past_due: { label: 'Pago Pendiente', color: 'amber' },
    cancelled: { label: 'Cancelado', color: 'red' },
    inactive: { label: 'Sin Suscripción', color: 'zinc' },
  };

  const status = statusMap[subscriptionStatus] || statusMap.inactive;

  const openStripePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'No se pudo abrir el portal de Stripe.');
      }
    } catch (e: any) {
      alert('Error al conectar con Stripe: ' + e.message);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h1 className="text-4xl font-black glow-text flex items-center gap-3">
          <Wallet className="w-10 h-10 text-[var(--color-primary)]" />
          {language === 'en' ? 'Billing & Commisions' : 'Facturación y Comisiones'}
        </h1>
        <p className="text-white/60 font-medium italic">
          Gestión económica de la Marca Blanca
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 border-emerald-500/20 bg-emerald-500/5 col-span-1 md:col-span-2">
           <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Plan Actual</p>
                <p className="text-4xl font-black text-white capitalize">{subscriptionTier}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Estado</p>
                <span className={`px-3 py-1 bg-${status.color}-500/20 text-${status.color}-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-${status.color}-500/20`}>
                  {status.label}
                </span>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 truncate">Cliente Stripe</p>
                <div className="flex items-center gap-2 mt-2">
                  <CreditCard size={18} className="text-white/40" />
                  <span className="text-sm font-bold text-white">
                    {profile?.stripe_customer_id 
                      ? `${profile.stripe_customer_id.slice(0, 8)}...` 
                      : 'No vinculado'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Suscripción</p>
                <p className="text-sm font-bold text-white mt-2">
                  {profile?.stripe_subscription_id 
                    ? `${profile.stripe_subscription_id.slice(0, 12)}...` 
                    : 'Sin suscripción activa'}
                </p>
              </div>
           </div>

           <div className="mt-8 flex gap-4">
              {profile?.stripe_customer_id ? (
                <GlowButton onClick={openStripePortal} className="text-xs px-6 py-3">
                  {portalLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Abriendo...</>
                  ) : (
                    <><ExternalLink className="w-4 h-4 mr-2" /> Gestionar en Stripe</>
                  )}
                </GlowButton>
              ) : (
                <p className="text-sm text-white/40 italic">Realiza tu primera suscripción para acceder al portal de pagos.</p>
              )}
           </div>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <TrendingUp size={80} />
           </div>
           <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Revenue Sharing</h3>
           <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                   <span className="text-white/60">Socios con plan activo</span>
                   <span className="text-white font-bold">{tenant ? '—' : '0'}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-[var(--color-primary)] w-[0%]" />
                </div>
              </div>
              <div className="pt-4 space-y-2">
                 <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-white/30">
                    <span>Comisión Cooperativa (20%)</span>
                    <span className="text-emerald-400">Pendiente</span>
                 </div>
              </div>
           </div>
           <p className="text-[10px] text-white/40 italic mt-6 border-t border-white/5 pt-4 leading-relaxed">
             Este balance se calculará automáticamente cuando los socios tengan suscripciones activas.
           </p>
        </GlassCard>
      </div>

      {/* Security Note */}
      <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20">
         <ShieldCheck className="text-blue-400 shrink-0" size={20} />
         <p className="text-[10px] text-blue-400/80 font-medium">
           Tus datos de pago están protegidos mediante el estándar PCI Service Provider Level 1. Inagrosolutions nunca almacena tu tarjeta completa en sus servidores. Toda la gestión se realiza directamente en Stripe.
         </p>
      </div>
    </div>
  );
}
