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
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { getTenantBillingDashboard } from '@/lib/actions/billing';

export default function TenantBillingPage() {
  const { tenant, profile } = useAgriProfile();
  const { language } = useI18n();
  const [portalLoading, setPortalLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (tenant?.id) {
      getTenantBillingDashboard(tenant.id)
        .then(setDashboardData)
        .catch(console.error)
        .finally(() => setLoadingData(false));
    } else {
      setLoadingData(false);
    }
  }, [tenant]);

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

  const handleConnectStripe = async () => {
    if (!tenant?.id) return;
    try {
      const res = await fetch('/api/stripe/connect/account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tenant.id })
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Error al generar link');
      }
    } catch (e: any) {
      alert('Error de Stripe: ' + e.message);
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
           
           <div className="flex justify-between items-start mb-4">
             <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Revenue Sharing</h3>
             {dashboardData?.connectState?.status === 'completed' ? (
               <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold uppercase">Connect Activo</span>
             ) : (
               <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/20 font-bold uppercase">Pendiente KYC</span>
             )}
           </div>

           {loadingData ? (
             <div className="animate-pulse space-y-4 pt-4">
               <div className="h-4 bg-white/10 rounded w-3/4"></div>
               <div className="h-4 bg-white/10 rounded w-1/2"></div>
             </div>
           ) : (
             <div className="space-y-4">
               {dashboardData?.connectState?.status !== 'completed' && (
                 <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                   <p className="text-xs text-amber-400 mb-2 font-medium flex items-start gap-2">
                     <AlertCircle size={14} className="shrink-0 mt-0.5" />
                     Debes completar el proceso KYC con Stripe para poder cobrar las suscripciones de tus socios.
                   </p>
                   <button onClick={handleConnectStripe} className="text-xs font-bold text-amber-300 underline hover:text-amber-200">
                     Continuar verificación
                   </button>
                 </div>
               )}

               <div>
                 <div className="flex justify-between text-xs mb-2">
                    <span className="text-white/60">Socios activos (de pago)</span>
                    <span className="text-white font-bold">{dashboardData?.stats?.activeUsers || 0}</span>
                 </div>
                 <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-primary)] w-full opacity-50" />
                 </div>
               </div>
               
               <div className="pt-4 grid grid-cols-2 gap-4 border-t border-white/5">
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Ingresos Mensuales</p>
                   <p className="text-xl font-bold text-emerald-400">{dashboardData?.stats?.monthlyRevenue?.toFixed(2) || '0.00'} €</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Comisiones Totales</p>
                   <p className="text-xl font-bold text-white">{dashboardData?.stats?.totalCommissions?.toFixed(2) || '0.00'} €</p>
                 </div>
               </div>
             </div>
           )}
           
           <p className="text-[10px] text-white/40 italic mt-6 border-t border-white/5 pt-4 leading-relaxed flex justify-between items-center">
             <span>El 50% de cada suscripción va directamente a la cuenta bancaria de tu cooperativa.</span>
             {dashboardData?.connectState?.status === 'completed' && (
                <a href="https://connect.stripe.com/express_login" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  <ExternalLink size={12} /> Dashboard Stripe
                </a>
             )}
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
