'use client';

import React, { useEffect, useState } from 'react';
import { getTechnicianDashboardData } from '@/lib/actions/technician';
import { GlassCard } from '@/components/ui/GlassCard';
import { Users, Map, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function TechnicianPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTechnicianDashboardData().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-white/50 text-sm font-bold animate-pulse">Cargando panel del técnico...</div>;

  const kpis = [
    { label: 'Agricultores Asignados', value: stats.totalFarmers || 0, icon: Users, color: 'text-indigo-400' },
    { label: 'Explotaciones Supervisadas', value: stats.totalExplotaciones || 0, icon: Map, color: 'text-emerald-400' },
    { label: 'Cuadernos Pendientes', value: stats.cuadernosPendientes || 0, icon: CheckCircle2, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <h3 className="text-lg font-bold text-white mb-4">Herramientas</h3>
          <div className="flex flex-col gap-4">
            <Link href="/technician/farmers" className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/5 flex items-center gap-3 group">
              <Users className="w-5 h-5 text-white/50 group-hover:text-emerald-400 transition-colors" />
              <div className="flex flex-col">
                <span className="font-bold text-white/80 group-hover:text-white transition-colors">Mis Clientes (Agricultores)</span>
                <span className="text-xs text-white/40">Ver explotaciones, cuadernos de campo y compliance</span>
              </div>
            </Link>

            <Link href="/technician/recommendations" className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/5 flex items-center gap-3 group">
              <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white/80 group-hover:text-white transition-colors">Emisión de Prescripciones</span>
                <span className="text-xs text-white/40">Crear recetas fitosanitarias y tareas agronómicas</span>
              </div>
            </Link>
          </div>
        </GlassCard>
      </div>

      <div className="mt-8">
        <GlassCard className="p-6 border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Actividad Reciente en tus Explotaciones</h3>
            <Link href="/technician/tasks" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Ver todo
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((act: any, i: number) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                  <div className={`p-3 rounded-xl ${act.bg}`}>
                    <CheckCircle2 className={`w-5 h-5 ${act.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white text-sm">{act.type}: {act.item}</h4>
                      <span className="text-xs font-bold text-white/40">{act.time}</span>
                    </div>
                    <p className="text-sm text-white/60 mt-1">Agricultor: <span className="font-bold text-white/80">{act.farmer}</span></p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                <p className="text-white/40 text-sm font-bold">No hay actividad reciente registrada por tus agricultores.</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
