'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import {
  Receipt, Plus, Download, CheckCircle2, XCircle, Clock, AlertCircle,
  Filter, Euro, Building2, Loader2, FileText, Eye, TrendingUp, Users,
  Calendar, ChevronDown, RefreshCw, Zap
} from 'lucide-react';
import {
  listAllInvoices, generateInvoiceForTenant, generateBulkInvoices,
  markInvoiceAsPaid, cancelInvoice, getInvoicingStats
} from '@/lib/actions/invoices';
import { getTenantsList } from '@/lib/actions/superadmin';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  draft:     { label: 'Borrador',  color: 'zinc',    icon: FileText },
  issued:    { label: 'Emitida',   color: 'blue',    icon: Clock },
  paid:      { label: 'Pagada',    color: 'emerald', icon: CheckCircle2 },
  overdue:   { label: 'Vencida',   color: 'red',     icon: AlertCircle },
  cancelled: { label: 'Cancelada', color: 'zinc',    icon: XCircle },
};

export default function SuperadminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filtros
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTenant, setFilterTenant] = useState('');

  // Modal de generación
  const [showGenModal, setShowGenModal] = useState(false);
  const [genMode, setGenMode] = useState<'single' | 'bulk'>('bulk');
  const [genTenantId, setGenTenantId] = useState('');
  const [genPeriod, setGenPeriod] = useState(() => {
    const prev = subMonths(new Date(), 1);
    return {
      start: format(startOfMonth(prev), 'yyyy-MM-dd'),
      end: format(endOfMonth(prev), 'yyyy-MM-dd'),
    };
  });
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState<any>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      listAllInvoices({ status: filterStatus || undefined, tenantId: filterTenant || undefined }),
      getTenantsList(),
      getInvoicingStats(),
    ]).then(([inv, ten, st]) => {
      setInvoices(inv);
      setTenants(ten);
      setStats(st);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus, filterTenant]);

  const handleGenerate = async () => {
    setGenLoading(true);
    setGenResult(null);
    try {
      if (genMode === 'bulk') {
        const results = await generateBulkInvoices({ periodStart: genPeriod.start, periodEnd: genPeriod.end });
        setGenResult(results);
      } else {
        if (!genTenantId) { alert('Selecciona una entidad'); return; }
        await generateInvoiceForTenant({ tenantId: genTenantId, periodStart: genPeriod.start, periodEnd: genPeriod.end });
        setGenResult([{ success: true, name: tenants.find(t => t.id === genTenantId)?.name }]);
      }
      load();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setGenLoading(false);
    }
  };

  const handleMarkPaid = (id: string) => {
    startTransition(async () => {
      await markInvoiceAsPaid(id);
      load();
    });
  };

  const handleCancel = (id: string) => {
    if (!confirm('¿Cancelar esta factura?')) return;
    startTransition(async () => {
      await cancelInvoice(id);
      load();
    });
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-400" />
            Facturación — Licencias InagroSolutions
          </h2>
          <p className="text-xs text-white/40 mt-1">Facturas emitidas a cooperativas por licencia SaaS (50% revenue sharing)</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
            <RefreshCw size={16} className={`text-white/40 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <GlowButton onClick={() => setShowGenModal(true)} className="px-5 py-2.5 text-xs">
            <Plus size={14} className="mr-2" />
            Generar Facturas
          </GlowButton>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Base Imponible (año)', value: formatCurrency(stats.totalRevenue), icon: Euro, color: 'emerald' },
            { label: 'IVA Total Año', value: formatCurrency(stats.totalVat), icon: Receipt, color: 'blue' },
            { label: 'Total Facturado', value: formatCurrency(stats.totalGross), icon: TrendingUp, color: 'violet' },
            { label: 'Facturas Pendientes', value: `${stats.pending} / ${stats.totalIssued}`, icon: Clock, color: 'amber' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <GlassCard key={i} className="p-5 flex items-center gap-4">
                <div className={`p-2.5 bg-${s.color}-500/10 rounded-xl`}>
                  <Icon size={20} className={`text-${s.color}-400`} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{s.label}</p>
                  <p className="text-lg font-black text-white">{s.value}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-emerald-500/50"
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          value={filterTenant}
          onChange={e => setFilterTenant(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-emerald-500/50"
        >
          <option value="">Todas las entidades</option>
          {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* Tabla de facturas */}
      <GlassCard className="border-white/5 overflow-x-auto">
        {loading ? (
          <div className="p-16 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white/20" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <Receipt className="w-12 h-12 text-white/10 mx-auto" />
            <p className="text-white/30 font-bold text-sm">No hay facturas generadas aún.</p>
            <button
              onClick={() => setShowGenModal(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline font-bold"
            >
              Generar primera factura →
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/[0.02] border-b border-white/5 text-xs uppercase font-bold text-white/40">
              <tr>
                <th className="px-5 py-4">Nº Factura</th>
                <th className="px-5 py-4">Entidad</th>
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
                      <p className="font-bold text-white text-sm">{inv.tenants?.name || '—'}</p>
                      <p className="text-xs text-white/30">{inv.tenants?.fiscal_cif || inv.recipient_cif || 'Sin CIF'}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-white/50">
                      <p>{inv.period_start ? format(new Date(inv.period_start), 'dd/MM/yyyy') : '—'}</p>
                      <p>{inv.period_end ? format(new Date(inv.period_end), 'dd/MM/yyyy') : '—'}</p>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-white">{formatCurrency(inv.subtotal_eur)}</td>
                    <td className="px-5 py-4 text-right text-white/60">{formatCurrency(inv.tax_amount_eur)}</td>
                    <td className="px-5 py-4 text-right font-black text-emerald-400">{formatCurrency(inv.total_eur)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border bg-${sc.color}-500/10 text-${sc.color}-400 border-${sc.color}-500/20`}>
                        <Icon size={10} />
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Ver/Descargar */}
                        <a
                          href={`/api/invoices/${inv.id}?format=html`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                          title="Ver factura"
                        >
                          <Eye size={14} className="text-white/50" />
                        </a>
                        <a
                          href={`/api/invoices/${inv.id}?format=pdf`}
                          download={`${inv.invoice_number}.html`}
                          className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                          title="Descargar factura"
                        >
                          <Download size={14} className="text-white/50" />
                        </a>
                        {/* Marcar como pagada */}
                        {(inv.status === 'issued' || inv.status === 'overdue') && (
                          <button
                            onClick={() => handleMarkPaid(inv.id)}
                            disabled={isPending}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-all"
                            title="Marcar como pagada"
                          >
                            <CheckCircle2 size={14} className="text-emerald-400" />
                          </button>
                        )}
                        {/* Cancelar */}
                        {inv.status !== 'cancelled' && inv.status !== 'paid' && (
                          <button
                            onClick={() => handleCancel(inv.id)}
                            disabled={isPending}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all"
                            title="Cancelar factura"
                          >
                            <XCircle size={14} className="text-red-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </GlassCard>

      {/* ─── Modal Generación ─── */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <GlassCard className="w-full max-w-lg p-8 border-white/10 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Zap size={20} className="text-emerald-400" />
                Generar Facturas de Licencia
              </h3>
              <button onClick={() => { setShowGenModal(false); setGenResult(null); }}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/40">×</button>
            </div>

            {!genResult ? (
              <>
                {/* Modo */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { mode: 'bulk', label: 'Todas las Entidades', icon: Building2 },
                    { mode: 'single', label: 'Entidad Específica', icon: Users },
                  ].map(({ mode, label, icon: Icon }) => (
                    <button
                      key={mode}
                      onClick={() => setGenMode(mode as any)}
                      className={`p-4 rounded-xl border text-left transition-all ${genMode === mode
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                        : 'bg-white/[0.02] border-white/5 text-white/40 hover:text-white hover:border-white/10'}`}
                    >
                      <Icon size={18} className="mb-2" />
                      <p className="text-xs font-black uppercase tracking-widest">{label}</p>
                    </button>
                  ))}
                </div>

                {/* Entidad específica */}
                {genMode === 'single' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Entidad</label>
                    <select
                      value={genTenantId}
                      onChange={e => setGenTenantId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50"
                    >
                      <option value="">Selecciona una entidad...</option>
                      {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                )}

                {/* Período */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Inicio Período</label>
                    <input type="date" value={genPeriod.start} onChange={e => setGenPeriod(p => ({ ...p, start: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Fin Período</label>
                    <input type="date" value={genPeriod.end} onChange={e => setGenPeriod(p => ({ ...p, end: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50" />
                  </div>
                </div>

                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                  <p className="text-xs text-amber-400/80 leading-relaxed">
                    <strong className="text-amber-400">Nota:</strong> Se calculará el 50% de las suscripciones cobradas en el período seleccionado. Cada factura se genera con número único y estado "Emitida". Debes enviarla manualmente al partner o integrarlo con tu sistema de email.
                  </p>
                </div>

                <GlowButton onClick={handleGenerate} isLoading={genLoading} className="w-full py-4 text-sm font-black">
                  {genLoading ? 'Generando...' : `Generar ${genMode === 'bulk' ? 'para Todas las Entidades' : 'Factura'}`}
                </GlowButton>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-bold text-white">Resultado de la generación:</p>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {genResult.map((r: any, i: number) => (
                    <div key={i} className={`p-3 rounded-xl border text-xs flex items-center gap-3 ${r.success
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                      {r.success ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      <span className="font-bold">{r.name}</span>
                      {!r.success && <span className="text-red-400/70">— {r.error}</span>}
                      {r.success && r.invoice && <span className="ml-auto font-mono text-emerald-400/70">{r.invoice.invoice_number}</span>}
                    </div>
                  ))}
                </div>
                <button onClick={() => { setShowGenModal(false); setGenResult(null); }}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all">
                  Cerrar
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
