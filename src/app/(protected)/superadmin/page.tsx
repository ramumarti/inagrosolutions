'use client';

import React, { useEffect, useState } from 'react';
import { getPlatformStats } from '@/lib/actions/superadmin';
import { getSuperadminBillingStats } from '@/lib/actions/billing';
import { GlassCard } from '@/components/ui/GlassCard';
import { Users, Building2, Map, TrendingUp, History, ArrowRight, Activity, Crown } from 'lucide-react';
import Link from 'next/link';

export default function SuperadminPage() {
  const [stats, setStats] = useState<any>(null);
  const [billingStats, setBillingStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getPlatformStats(), getSuperadminBillingStats()])
      .then(([statsData, billingData]) => {
        setStats(statsData);
        setBillingStats(billingData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setErrorMsg(err.message || 'Error al cargar los datos');
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="p-8 space-y-8 animate-pulse">
      <div className="h-40 bg-white/5 rounded-3xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
      </div>
    </div>
  );

  if (errorMsg) return <div className="text-red-400 text-sm font-bold bg-red-500/10 p-4 rounded-xl">Error: {errorMsg}</div>;

  const kpis = [
    { label: 'Entidades Activas', value: stats.totalTenants, icon: Building2, color: 'text-indigo-400' },
    { label: 'Tasa Conversión', value: `${billingStats?.conversionRate || 0}%`, icon: Crown, color: 'text-amber-400' },
    { label: 'MRR (Facturado)', value: `${billingStats?.mrr?.toFixed(2) || '0.00'} €`, icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Ingresos Totales', value: `${billingStats?.totalRevenue?.toFixed(2) || '0.00'} €`, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Usuarios Totales', value: stats.totalUsers, icon: Users, color: 'text-emerald-400' },
    { label: 'Churn Rate', value: `${billingStats?.churnRate || 0}%`, icon: Activity, color: 'text-red-400' },
  ];

  const maxTrend = Math.max(...(stats.trend?.map((t: any) => t.count) || [1]));

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white glow-text">Portal Superadmin</h1>
        <p className="text-white/40 font-medium">Control global de InagroSolutions</p>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <GlassCard key={i} className="p-6 border-white/5 flex flex-col gap-4 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/[0.02] rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/5 ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white/30">{kpi.label}</h3>
              </div>
              <p className="text-3xl font-black text-white">{kpi.value.toLocaleString()}</p>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ACTIVITY TREND CHART (CSS BARS) */}
        <GlassCard className="lg:col-span-2 p-6 border-white/5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <Activity className="text-emerald-400 w-5 h-5" />
                <h3 className="font-bold text-white uppercase text-xs tracking-widest">Actividad (Últimos 7 días)</h3>
             </div>
             <span className="text-[10px] text-white/30 font-black tracking-widest uppercase">Consultas Auditadas</span>
          </div>
          
          <div className="flex items-end justify-between h-40 gap-2 mt-4 px-2">
            {stats.trend?.map((t: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative">
                <div 
                  className="w-full bg-emerald-500/20 rounded-t-lg group-hover:bg-emerald-500/40 transition-all duration-500 relative min-h-[4px]" 
                  style={{ height: `${(t.count / maxTrend) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] px-2 py-0.5 rounded font-black opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.count}
                  </div>
                </div>
                <span className="text-[9px] font-black text-white/30 uppercase">
                  {new Date(t.day).toLocaleDateString('es-ES', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* RECENT ACTIVITY */}
        <GlassCard className="p-6 border-white/5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <History className="text-blue-400 w-5 h-5" />
               <h3 className="font-bold text-white uppercase text-xs tracking-widest">Eventos Recientes</h3>
            </div>
            <Link href="/superadmin/audit" className="text-[10px] font-black text-white/30 hover:text-white flex items-center gap-1 transition-colors uppercase tracking-widest">
               Ver Todo <ArrowRight size={10} />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
             {stats.recentActivity?.map((log: any) => (
               <div key={log.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                 <div className={`mt-1 p-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                    log.action === 'INSERT' ? 'bg-emerald-500/10 text-emerald-400' :
                    log.action === 'UPDATE' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-red-500/10 text-red-400'
                 }`}>
                   {log.action[0]}
                 </div>
                 <div className="flex flex-col flex-1 gap-1">
                    <p className="text-xs font-bold text-white/80 leading-tight">
                       {log.entity_type} <span className="opacity-50">by</span> {log.user?.first_name || 'System'}
                    </p>
                    <p className="text-[10px] text-white/30 uppercase font-black">{log.tenant?.name || 'InagroSolutions'}</p>
                 </div>
                 <span className="text-[9px] text-white/20 font-mono italic">
                   {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>
               </div>
             ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
