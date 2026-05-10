"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { useAgriProfile } from '@/hooks/useAgriProfile';
import { useI18n } from '@/lib/i18n';
import { 
  Wallet, CreditCard, ShieldCheck, TrendingUp, ExternalLink, 
  Loader2, AlertCircle, CheckCircle2, Clock, ArrowRight, 
  Building2, Landmark, FileText, Users, Euro, Zap, Info
} from 'lucide-react';
import { getTenantBillingDashboard } from '@/lib/actions/billing';
import { Suspense } from 'react';

function BillingContent() {
  const { tenant, profile } = useAgriProfile();
  const { language } = useI18n();
  const searchParams = useSearchParams();
  const [portalLoading, setPortalLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  const onboardingComplete = searchParams.get('onboarding') === 'complete';
  const onboardingRefresh = searchParams.get('refresh') === 'true';

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

  const openStripePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'No se pudo abrir el portal de Stripe.');
    } catch (e: any) {
      alert('Error al conectar con Stripe: ' + e.message);
    } finally {
      setPortalLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    if (!tenant?.id) return;
    setConnectLoading(true);
    try {
      const res = await fetch('/api/stripe/connect/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tenant.id })
      });
      const data = await res.json();
      if (res.ok && data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      } else {
        alert(data.error || 'Error al generar link de Stripe');
      }
    } catch (e: any) {
      alert('Error de Stripe: ' + e.message);
    } finally {
      setConnectLoading(false);
    }
  };

  const connectStatus = dashboardData?.connectState?.status;
  const isConnected = connectStatus === 'completed';
  const isPending = connectStatus === 'pending' || connectStatus === 'restricted';
  const isNotCreated = !connectStatus || connectStatus === 'not_created';

  const stats = dashboardData?.stats;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Success banner tras completar el KYC */}
      {onboardingComplete && (
        <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl animate-in slide-in-from-top-2 duration-500">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-black text-emerald-400">¡Stripe Connect configurado correctamente!</p>
            <p className="text-xs text-emerald-400/70 mt-0.5">Tu cooperativa ya puede recibir pagos de tus agricultores. La activación puede tardar unos minutos en confirmarse.</p>
          </div>
        </div>
      )}

      {onboardingRefresh && !onboardingComplete && (
        <div className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
          <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-black text-amber-400">El proceso de verificación fue interrumpido</p>
            <p className="text-xs text-amber-400/70 mt-0.5">Pulsa "Continuar verificación" para retomar el proceso donde lo dejaste.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-4xl font-black glow-text flex items-center gap-3">
          <Wallet className="w-10 h-10 text-[var(--color-primary)]" />
          Facturación y Comisiones
        </h1>
        <p className="text-white/60 font-medium italic">
          Gestión económica de tu Marca Blanca — Modelo de Revenue Sharing 50/50
        </p>
      </header>

      {/* === SECCIÓN STRIPE CONNECT === */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
          <Zap size={14} className="text-amber-400" />
          Stripe Connect — Activar Cobros
        </h2>

        {loadingData ? (
          <GlassCard className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-white/30" />
          </GlassCard>
        ) : (
          <GlassCard className={`p-6 relative overflow-hidden ${isConnected ? 'border-emerald-500/20 bg-emerald-500/5' : isPending ? 'border-amber-500/20 bg-amber-500/5' : 'border-white/10'}`}>
            
            {/* Estado Connect */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  {isConnected ? (
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                  ) : isPending ? (
                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                      <Landmark className="w-5 h-5 text-white/40" />
                    </div>
                  )}
                  <div>
                    <p className="font-black text-white text-lg">
                      {isConnected ? 'Cuenta Stripe Activa' : isPending ? 'Verificación Pendiente' : 'Conecta tu Cuenta Bancaria'}
                    </p>
                    <p className={`text-xs font-bold ${isConnected ? 'text-emerald-400' : isPending ? 'text-amber-400' : 'text-white/40'}`}>
                      {isConnected ? `ID: ${dashboardData?.connectState?.accountId?.slice(0, 16)}...` : isPending ? 'KYC en proceso con Stripe' : 'Sin cuenta Connect configurada'}
                    </p>
                  </div>
                </div>

                {/* Wizard de pasos */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  {[
                    { 
                      icon: Building2, 
                      label: 'Datos Fiscales', 
                      desc: 'CIF, razón social, dirección',
                      done: !isNotCreated 
                    },
                    { 
                      icon: FileText, 
                      label: 'Verificación KYC', 
                      desc: 'Representante legal + IBAN',
                      done: isConnected 
                    },
                    { 
                      icon: CheckCircle2, 
                      label: 'Activación', 
                      desc: 'Stripe aprueba cobros',
                      done: isConnected 
                    },
                  ].map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <div 
                        key={i}
                        className={`p-4 rounded-xl border transition-all ${step.done ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/[0.02] border-white/5'}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon size={14} className={step.done ? 'text-emerald-400' : 'text-white/30'} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${step.done ? 'text-emerald-400' : 'text-white/30'}`}>
                            Paso {i + 1}
                          </span>
                          {step.done && <CheckCircle2 size={10} className="text-emerald-400 ml-auto" />}
                        </div>
                        <p className={`text-sm font-bold ${step.done ? 'text-white' : 'text-white/40'}`}>{step.label}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-3 lg:w-64 shrink-0">
                {isConnected ? (
                  <>
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Estado</p>
                      <p className="text-2xl font-black text-white">✓ Activo</p>
                      <p className="text-xs text-emerald-400/70 mt-1">Cobros habilitados</p>
                    </div>
                    <a
                      href="https://connect.stripe.com/express_login"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white/60 hover:text-white transition-all"
                    >
                      <ExternalLink size={14} />
                      Dashboard de Stripe
                    </a>
                  </>
                ) : isPending ? (
                  <>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <p className="text-xs text-amber-400 font-medium leading-relaxed">
                        Stripe está revisando tu información. Puede tardar hasta 24-48h. Mientras tanto, los pagos de tus agricultores van a InagroSolutions y te serán transferidos una vez activo.
                      </p>
                    </div>
                    <GlowButton
                      onClick={handleConnectStripe}
                      isLoading={connectLoading}
                      className="w-full py-4 text-xs font-black uppercase tracking-wider"
                    >
                      {connectLoading ? 'Generando enlace...' : 'Continuar verificación'}
                      <ArrowRight size={14} className="ml-2" />
                    </GlowButton>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <p className="text-xs text-blue-400/80 leading-relaxed">
                        <strong className="text-blue-400">Necesitas conectar Stripe</strong> para recibir el 50% de cada suscripción de tus agricultores directamente en tu cuenta bancaria.
                      </p>
                    </div>
                    <GlowButton
                      onClick={handleConnectStripe}
                      isLoading={connectLoading}
                      className="w-full py-4 text-xs font-black uppercase tracking-wider"
                    >
                      {connectLoading ? 'Conectando...' : 'Conectar con Stripe'}
                      <ArrowRight size={14} className="ml-2" />
                    </GlowButton>
                    <p className="text-[10px] text-white/20 text-center">
                      Proceso seguro · KYC requerido · ~5 min
                    </p>
                  </>
                )}
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* === MODELO ECONÓMICO === */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
          <Euro size={14} className="text-emerald-400" />
          Modelo de Ingresos — Revenue Sharing
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stats */}
          {[
            { label: 'Agricultores activos', value: stats?.activeUsers || 0, icon: Users, color: 'emerald', suffix: '' },
            { label: 'Ingresos mensuales (tu 50%)', value: stats?.monthlyRevenue?.toFixed(2) || '0.00', icon: TrendingUp, color: 'blue', suffix: '€' },
            { label: 'Comisiones acumuladas', value: stats?.totalCommissions?.toFixed(2) || '0.00', icon: Wallet, color: 'violet', suffix: '€' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={i} className="p-6 flex items-center gap-4">
                <div className={`p-3 bg-${stat.color}-500/10 rounded-xl`}>
                  <Icon size={22} className={`text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{stat.label}</p>
                  <p className="text-2xl font-black text-white">{stat.value} <span className="text-sm text-white/40">{stat.suffix}</span></p>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Explicación visual del reparto */}
        <GlassCard className="p-6">
          <h3 className="text-sm font-black text-white mb-6 flex items-center gap-2">
            <Info size={16} className="text-blue-400" />
            ¿Cómo funciona el reparto de ingresos?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Agricultor paga</p>
              <p className="text-3xl font-black text-white">9,99 €</p>
              <p className="text-xs text-white/30 mt-1">ejemplo Plan Básico/mes</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ArrowRight size={24} className="text-white/20 hidden md:block" />
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest text-center">Stripe divide automáticamente</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Tu cooperativa</p>
                <p className="text-2xl font-black text-emerald-400">50%</p>
                <p className="text-xs text-emerald-400/60 mt-1">~5,00 €/mes</p>
                <p className="text-[9px] text-emerald-400/40 mt-1">Payout semanal directo a tu IBAN</p>
              </div>
              <div className="text-center p-4 bg-white/5 border border-white/5 rounded-xl">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">InagroSolutions</p>
                <p className="text-2xl font-black text-white/60">50%</p>
                <p className="text-xs text-white/30 mt-1">~5,00 €/mes</p>
                <p className="text-[9px] text-white/20 mt-1">Plataforma + soporte técnico</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
            <p className="text-[11px] text-blue-400/80 leading-relaxed">
              <strong className="text-blue-400">Nota fiscal:</strong> Con Stripe Connect Express (Direct Charges), la factura al agricultor se genera en nombre de tu cooperativa. InagroSolutions recibe su parte como <em>application fee</em>. No es necesario que emitas facturas a InagroSolutions — Stripe gestiona la liquidación automáticamente y la cooperativa sí declara el IVA de los cobros recibidos (21%, Mod. 303 trimestral).
            </p>
          </div>
        </GlassCard>
      </div>

      {/* === SUSCRIPCIÓN DE LA PROPIA COOPERATIVA === */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
          <CreditCard size={14} className="text-indigo-400" />
          Tu Suscripción como Partner
        </h2>
        <GlassCard className="p-6 border-indigo-500/10 bg-indigo-500/5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Plan Cooperativa</p>
              <p className="text-3xl font-black text-white capitalize">{profile?.subscription_tier || 'Gratuito'}</p>
              <p className="text-sm text-white/40 mt-1">El acceso al panel de administración es gratuito durante el periodo de lanzamiento.</p>
            </div>
            {profile?.stripe_customer_id && (
              <GlowButton onClick={openStripePortal} className="text-xs px-6 py-3">
                {portalLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Abriendo...</>
                ) : (
                  <><ExternalLink className="w-4 h-4 mr-2" /> Gestionar en Stripe</>
                )}
              </GlowButton>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Security Note */}
      <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
        <ShieldCheck className="text-blue-400 shrink-0" size={20} />
        <p className="text-[10px] text-blue-400/80 font-medium leading-relaxed">
          Tus datos de pago están protegidos mediante el estándar PCI Service Provider Level 1. InagroSolutions nunca almacena datos bancarios en sus servidores. Toda la gestión de pagos se realiza directamente en Stripe, plataforma de pagos número 1 en Europa.
        </p>
      </div>
    </div>
  );
}

export default function TenantBillingPage() {
  return (
    <Suspense fallback={<div className="p-8 animate-pulse text-white/20">Cargando facturación...</div>}>
      <BillingContent />
    </Suspense>
  );
}
