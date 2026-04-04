'use client';

import React, { useEffect, useState } from 'react';
import { getPlatformStats } from '@/lib/actions/superadmin';
import { GlassCard } from '@/components/ui/GlassCard';
import { Users, Building2, Map, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function SuperadminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlatformStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-white/50 text-sm font-bold animate-pulse">Cargando métricas...</div>;

  const kpis = [
    { label: 'Entidades Activas', value: stats.totalTenants, icon: Building2, color: 'text-indigo-400' },
    { label: 'Usuarios Totales', value: stats.totalUsers, icon: Users, color: 'text-emerald-400' },
    { label: 'Explotaciones Registradas', value: stats.totalFarms, icon: Map, color: 'text-amber-400' },
    { label: 'MRR Estimado', value: `€${stats.mrr}`, icon: TrendingUp, color: 'text-blue-400' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 mt-4 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <GlassCard key={i} className="p-6 border-white/5 flex flex-col gap-4 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/[0.02] rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/5 ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white/50">{kpi.label}</h3>
              </div>
              <p className="text-3xl font-black text-white">{kpi.value}</p>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <GlassCard className="p-6 border-white/5">
          <h3 className="text-lg font-bold text-white mb-4">Accesos Rápidos</h3>
          <div className="flex flex-col gap-2">
            <Link href="/superadmin/tenants" className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-white/50 group-hover:text-emerald-400 transition-colors" />
                <span className="font-bold text-white/80 group-hover:text-white transition-colors">Gestión de Entidades</span>
              </div>
              <TrendingUp className="w-4 h-4 text-white/20" />
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
