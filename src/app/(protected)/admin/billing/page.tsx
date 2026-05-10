"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { useAgriProfile } from '@/hooks/useAgriProfile';
import {
  Wallet, CreditCard, ShieldCheck, TrendingUp, ExternalLink,
  Loader2, AlertCircle, CheckCircle2, Clock, ArrowRight,
  Building2, Landmark, FileText, Users, Euro, Zap, Info,
  Receipt, Download, Eye, XCircle, BarChart3
} from 'lucide-react';
import { getTenantBillingDashboard } from '@/lib/actions/billing';
import { listMyInvoices } from '@/lib/actions/invoices';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  draft:     { label: 'Borrador',  color: 'zinc',    icon: FileText },
  issued:    { label: 'Emitida',   color: 'blue',    icon: Clock },
  paid:      { label: 'Pagada',    color: 'emerald', icon: CheckCircle2 },
  overdue:   { label: 'Vencida',   color: 'red',     icon: AlertCircle },
  cancelled: { label: 'Cancelada', color: 'zinc',    icon: XCircle },
};

function BillingContent() {
  const { tenant, profile } = useAgriProfile();
  const searchParams = useSearchParams();
  const [connectLoading, setConnectLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'connect' | 'invoices' | 'income'>('connect');

  const onboardingComplete = searchParams.get('onboarding') === 'complete';
  const onboardingRefresh = searchParams.get('refresh') === 'true';

  useEffect(() => {
    if (tenant?.id) {
      Promise.all([
        getTenantBillingDashboard(tenant.id),
        listMyInvoices(),
      ]).then(([dash, inv]) => {
        setDashboardData(dash);
        setInvoices(inv);
      }).catch(console.error).finally(() => setLoadingData(false));
    } else {
      setLoadingData(false);
    }
  }, [tenant]);

  const openStripePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnUrl: window.location.href }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'No se pudo abrir el portal de Stripe.');
    } catch (e: any) { alert('Error: ' + e.message); } finally { setPortalLoading(false); }
  };

  const handleConnectStripe = async () => {
    if (!tenant?.id) return;
    setConnectLoading(true);
    try {
      const res = await fetch('/api/stripe/connect/create-account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenantId: tenant.id }) });
      const data = await res.json();
      if (res.ok && data.onboardingUrl) window.location.href = data.onboardingUrl;
      else alert(data.error || 'Error al generar link de Stripe');
    } catch (e: any) { alert('Error de Stripe: ' + e.message); } finally { setConnectLoading(false); }
  };

  const connectStatus = dashboardData?.connectState?.status;
  const isConnected = connectStatus === 'completed';
  const isPending = connectStatus === 'pending' || connectStatus === 'restricted';
  const isNotCreated = !connectStatus || connectStatus === 'not_created';
  const stats = dashboardData?.stats;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n || 0);

  const pendingAmount = invoices
    .filter(i => i.status === 'issued' || i.status === 'overdue')
    .reduce((s, i) => s + (i.total_eur || 0), 0);

  const paidAmount = invoices
    .filter(i => i.status === 'paid')
    .reduce((s, i) => s + (i.total_eur || 0), 0);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Banners de estado */}
      {onboardingComplete && (
        <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl animate-in slide-in-from-top-2 duration-500">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-black text-emerald-400">¡Stripe Connect configurado correctamente!</p>
            <p className="text-xs text-emerald-400/70 mt-0.5">Ya puedes recibir pagos directamente en tu cuenta bancaria.</p>
          </div>
        </div>
      )}
      {onboardingRefresh && !onboardingComplete && (
        <div className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
          <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-black text-amber-400">Proceso interrumpido — Pulsa "Continuar verificación"</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-4xl font-black glow-text flex items-center gap-3">
          <Wallet className="w-10 h-10 text-[var(--color-primary)]" />
          Facturación y Comisiones
        </h1>
        <p className="text-white/60 font-medium italic">Gestiona tus cobros, facturas de licencia y actividad económica</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/5 w-fit">
        {[
          { key: 'connect', label: 'Stripe Connect', icon: Landmark },
          { key: 'invoices', label: `Facturas (${invoices.length})`, icon: Receipt },
          { key: 'income', label: 'Ingresos', icon: TrendingUp },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === key
              ? 'bg-[var(--color-primary)] text-white shadow-lg'
              : 'text-white/40 hover:text-white'}`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ─── TAB: STRIPE CONNECT ─── */}
      {activeTab === 'connect' && (
        <div className="space-y-6">
          {loadingData ? (
            <GlassCard className="p-8 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></GlassCard>
          ) : (
            <GlassCard className={`p-6 ${isConnected ? 'border-emerald-500/20 bg-emerald-500/5' : isPending ? 'border-amber-500/20 bg-amber-500/5' : 'border-white/10'}`}>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isConnected ? 'bg-emerald-500/20' : isPending ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                      {isConnected ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : isPending ? <Clock className="w-5 h-5 text-amber-400 animate-pulse" /> : <Landmark className="w-5 h-5 text-white/40" />}
                    </div>
                    <div>
                      <p className="font-black text-white text-lg">{isConnected ? 'Cuenta Stripe Activa' : isPending ? 'Verificación Pendiente' : 'Conecta tu Cuenta Bancaria'}</p>
                      <p className={`text-xs font-bold ${isConnected ? 'text-emerald-400' : isPending ? 'text-amber-400' : 'text-white/40'}`}>
                        {isConnected ? 'Cobros habilitados · Payout semanal cada lunes' : isPending ? 'KYC en proceso con Stripe' : 'Requerido para recibir el 50% de cada suscripción'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Datos Fiscales', desc: 'CIF, razón social', done: !isNotCreated },
                      { label: 'KYC Stripe', desc: 'Representante + IBAN', done: isConnected },
                      { label: 'Activación', desc: 'Cobros habilitados', done: isConnected },
                    ].map((step, i) => (
                      <div key={i} className={`p-4 rounded-xl border ${step.done ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/[0.02] border-white/5'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${step.done ? 'text-emerald-400' : 'text-white/30'}`}>Paso {i + 1}</span>
                          {step.done && <CheckCircle2 size={10} className="text-emerald-400" />}
                        </div>
                        <p className={`text-xs font-bold ${step.done ? 'text-white' : 'text-white/40'}`}>{step.label}</p>
                        <p className="text-[9px] text-white/20 mt-0.5">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:w-60 shrink-0">
                  {isConnected ? (
                    <>
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Estado Connect</p>
                        <p className="text-2xl font-black text-white">✓ Activo</p>
                        <p className="text-xs text-emerald-400/70 mt-1">Cobros habilitados</p>
                      </div>
                      <a href="https://connect.stripe.com/express_login" target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white/60 hover:text-white transition-all">
                        <ExternalLink size={14} />Dashboard de Stripe
                      </a>
                    </>
                  ) : (
                    <>
                      <GlowButton onClick={handleConnectStripe} isLoading={connectLoading} className="w-full py-4 text-xs font-black uppercase tracking-wider">
                        {connectLoading ? 'Conectando...' : isPending ? 'Continuar verificación' : 'Conectar con Stripe'}
                        <ArrowRight size={14} className="ml-2" />
                      </GlowButton>
                      <p className="text-[9px] text-white/20 text-center">Proceso seguro · KYC · ~5 min</p>
                    </>
                  )}
                </div>
              </div>
            </GlassCard>
          )}

          {/* Info modelo revenue sharing */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
              <Info size={16} className="text-blue-400" />¿Cómo funciona el reparto de ingresos?
            </h3>
            <div className="grid md:grid-cols-3 gap-4 items-center">
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Agricultor paga</p>
                <p className="text-3xl font-black text-white">9,99 €</p>
                <p className="text-xs text-white/30 mt-1">ejemplo / mes</p>
              </div>
              <div className="flex flex-col items-center"><ArrowRight size={24} className="text-white/20 hidden md:block" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Tu cooperativa</p>
                  <p className="text-2xl font-black text-emerald-400">50%</p>
                  <p className="text-xs text-emerald-400/60 mt-1">~5,00 €/mes</p>
                </div>
                <div className="text-center p-4 bg-white/5 border border-white/5 rounded-xl">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">InagroSolutions</p>
                  <p className="text-2xl font-black text-white/60">50%</p>
                  <p className="text-xs text-white/30 mt-1">Licencia SaaS</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ─── TAB: FACTURAS ─── */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          {/* Stats de facturas */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Facturas', value: invoices.length, color: 'white' },
              { label: 'Pendiente de Pago', value: formatCurrency(pendingAmount), color: 'amber' },
              { label: 'Total Pagado', value: formatCurrency(paidAmount), color: 'emerald' },
            ].map((s, i) => (
              <GlassCard key={i} className="p-5 text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">{s.label}</p>
                <p className={`text-xl font-black text-${s.color}`}>{s.value}</p>
              </GlassCard>
            ))}
          </div>

          {/* Tabla de facturas */}
          <GlassCard className="border-white/5 overflow-x-auto">
            {loadingData ? (
              <div className="p-12 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white/20" /></div>
            ) : invoices.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Receipt className="w-10 h-10 text-white/10 mx-auto" />
                <p className="text-white/30 text-sm font-bold">Aún no hay facturas emitidas.</p>
                <p className="text-white/20 text-xs">Las facturas de licencia mensual son emitidas por InagroSolutions al cierre de cada mes.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-white/70">
                <thead className="bg-white/[0.02] border-b border-white/5 text-xs uppercase font-bold text-white/40">
                  <tr>
                    <th className="px-5 py-4">Nº Factura</th>
                    <th className="px-5 py-4">Emisor</th>
                    <th className="px-5 py-4">Período</th>
                    <th className="px-5 py-4 text-right">Base Imp.</th>
                    <th className="px-5 py-4 text-right">IVA 21%</th>
                    <th className="px-5 py-4 text-right">Total</th>
                    <th className="px-5 py-4 text-center">Estado</th>
                    <th className="px-5 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.map(inv => {
                    const sc = STATUS_CONFIG[inv.status] || STATUS_CONFIG.issued;
                    const Icon = sc.icon;
                    return (
                      <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4 font-mono text-sm font-bold text-white">{inv.invoice_number}</td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-white text-sm">{inv.issuer_name}</p>
                          <p className="text-xs text-white/30">CIF: {inv.issuer_cif}</p>
                        </td>
                        <td className="px-5 py-4 text-xs text-white/50">
                          {inv.period_start && <p>{format(new Date(inv.period_start), "MMMM yyyy", { locale: es })}</p>}
                          <p className="text-white/30">{inv.active_subscriptions} agricultores activos</p>
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-white">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(inv.subtotal_eur)}
                        </td>
                        <td className="px-5 py-4 text-right text-white/60">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(inv.tax_amount_eur)}
                        </td>
                        <td className="px-5 py-4 text-right font-black text-[var(--color-primary)]">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(inv.total_eur)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold border bg-${sc.color}-500/10 text-${sc.color}-400 border-${sc.color}-500/20`}>
                            <Icon size={10} />{sc.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <a href={`/api/invoices/${inv.id}?format=html`} target="_blank" rel="noopener noreferrer"
                              className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all" title="Ver factura">
                              <Eye size={14} className="text-white/50" />
                            </a>
                            <a href={`/api/invoices/${inv.id}?format=pdf`} download={`${inv.invoice_number}.html`}
                              className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all" title="Descargar">
                              <Download size={14} className="text-white/50" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </GlassCard>

          {/* Explicación fiscal */}
          <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
            <p className="text-xs text-blue-400/80 leading-relaxed">
              <strong className="text-blue-400">Nota fiscal:</strong> Las facturas recibidas de InagroSolutions corresponden a la licencia de uso mensual de la plataforma (50% sobre suscripciones activas, conforme a la cláusula 3 del Contrato de Partner). Debes registrarlas como <strong className="text-blue-300">gasto deducible</strong> en tu contabilidad e incluir el IVA soportado (21%) en tu declaración trimestral (Mod. 303) de la AEAT.
            </p>
          </div>
        </div>
      )}

      {/* ─── TAB: INGRESOS ─── */}
      {activeTab === 'income' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Agricultores activos', value: stats?.activeUsers || 0, icon: Users, color: 'emerald', suffix: '' },
              { label: 'Ingresos mensuales (tu 50%)', value: `${(stats?.monthlyRevenue || 0).toFixed(2)} €`, icon: TrendingUp, color: 'blue', suffix: '' },
              { label: 'Comisiones acumuladas', value: `${(stats?.totalCommissions || 0).toFixed(2)} €`, icon: Wallet, color: 'violet', suffix: '' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <GlassCard key={i} className="p-6 flex items-center gap-4">
                  <div className={`p-3 bg-${s.color}-500/10 rounded-xl`}>
                    <Icon size={22} className={`text-${s.color}-400`} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{s.label}</p>
                    <p className="text-2xl font-black text-white">{s.value}</p>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {isConnected ? (
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-white">Dashboard de Stripe Express</h3>
                <a href="https://connect.stripe.com/express_login" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white/60 hover:text-white transition-all">
                  <ExternalLink size={14} />Ver en Stripe
                </a>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                Accede a tu Dashboard de Stripe Express para ver el detalle completo de tus cobros, payouts, historial de transacciones y el saldo pendiente de transferir a tu cuenta bancaria.
              </p>
            </GlassCard>
          ) : (
            <GlassCard className="p-8 text-center space-y-4">
              <Landmark className="w-10 h-10 text-white/10 mx-auto" />
              <p className="text-white/40 text-sm font-bold">Conecta tu cuenta Stripe para ver el historial de ingresos</p>
              <GlowButton onClick={handleConnectStripe} isLoading={connectLoading} className="mx-auto px-8 py-3 text-xs">
                Configurar Stripe Connect
              </GlowButton>
            </GlassCard>
          )}

          {/* Suscripción propia del partner */}
          <GlassCard className="p-6 border-indigo-500/10 bg-indigo-500/5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">Tu Suscripción como Partner</p>
                <p className="text-2xl font-black text-white capitalize">{profile?.subscription_tier || 'Gratuito'}</p>
                <p className="text-sm text-white/40 mt-1">El acceso al panel de administración es gratuito durante el lanzamiento.</p>
              </div>
              {profile?.stripe_customer_id && (
                <GlowButton onClick={openStripePortal} className="text-xs px-6 py-3">
                  {portalLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Abriendo...</> : <><ExternalLink className="w-4 h-4 mr-2" />Gestionar en Stripe</>}
                </GlowButton>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Security Note */}
      <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
        <ShieldCheck className="text-blue-400 shrink-0" size={20} />
        <p className="text-[10px] text-blue-400/80 font-medium leading-relaxed">
          Datos de pago protegidos mediante PCI DSS Level 1. InagroSolutions no almacena datos bancarios. Gestión realizada directamente en Stripe.
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
