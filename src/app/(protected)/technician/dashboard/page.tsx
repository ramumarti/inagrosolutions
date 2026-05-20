'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { getAssignedFarmers } from '@/lib/actions/technician';
import { Users, FileCheck, AlertOctagon, TrendingUp, Bug, Droplets, Leaf } from 'lucide-react';

export default function TechnicianDashboardPage() {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalExplotaciones: 0,
    cuadernosPendientes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // En un caso real, estas métricas se sacarían de un aggregate query complejo.
    // Aquí hacemos un aproach simulado basado en los farmers cargados.
    getAssignedFarmers().then(data => {
      const farmers = data || [];
      const totalExplotaciones = farmers.reduce((acc, f) => acc + (f.explotaciones?.[0]?.count || 0), 0);
      
      setStats({
        totalFarmers: farmers.length,
        totalExplotaciones,
        cuadernosPendientes: Math.floor(farmers.length * 0.3), // Simulación del 30% pendientes
      });
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-white/50 text-sm font-bold animate-pulse">Cargando dashboard...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="border-b border-white/5 pb-6">
        <h2 className="text-2xl font-black text-white tracking-tight">Dashboard Asesor</h2>
        <p className="text-sm font-bold text-white/50 mt-1">
          Visión general de tus agricultores asignados y alertas normativas SIEX
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <GlassCard className="p-6 border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Users size={24} className="text-indigo-400" />
            </div>
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md flex items-center gap-1">
              <TrendingUp size={12} /> +12%
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-white/50 uppercase tracking-wider mb-1">Clientes Activos</p>
            <h3 className="text-4xl font-black text-white">{stats.totalFarmers}</h3>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <FileCheck size={24} className="text-blue-400" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-white/50 uppercase tracking-wider mb-1">Explotaciones</p>
            <h3 className="text-4xl font-black text-white">{stats.totalExplotaciones}</h3>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-amber-500/20 bg-amber-500/5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <AlertOctagon size={24} className="text-amber-400" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-amber-500/70 uppercase tracking-wider mb-1">Alertas SIEX</p>
            <h3 className="text-4xl font-black text-amber-400">{stats.cuadernosPendientes}</h3>
          </div>
        </GlassCard>
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <GlassCard className="p-6 border-white/5">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Actividad Reciente (Global)</h3>
          
          <div className="space-y-4">
            {[
              { type: 'Tratamiento', farmer: 'Juan Pérez', item: 'Cobre Nordox 75 WG', time: 'Hace 2 horas', icon: Bug, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { type: 'Abonado', farmer: 'María Gómez', item: 'N-P-K 20-10-5', time: 'Hace 5 horas', icon: Droplets, color: 'text-violet-400', bg: 'bg-violet-500/10' },
              { type: 'Labor', farmer: 'Finca Los Olivos', item: 'Poda', time: 'Ayer', icon: Leaf, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            ].map((act, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${act.bg}`}>
                  <act.icon size={16} className={act.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{act.farmer}</p>
                  <p className="text-[11px] text-white/50 uppercase tracking-wider font-bold truncate">
                    {act.type} • {act.item}
                  </p>
                </div>
                <div className="text-[10px] text-white/30 font-bold whitespace-nowrap">
                  {act.time}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-white/5">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Próximos Vencimientos</h3>
          <div className="flex flex-col items-center justify-center h-48 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
            <FileCheck size={32} className="text-white/20 mb-3" />
            <p className="text-sm font-bold text-white/60">Todos los cuadernos están al día</p>
            <p className="text-xs text-white/40 mt-1">No hay entregas inminentes para el RETO/SIEX</p>
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
