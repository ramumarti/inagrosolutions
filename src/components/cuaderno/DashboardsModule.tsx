'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { createClient } from '@/lib/supabase/client';
import { BarChart3, Activity, Target, Leaf, Bug, Droplets, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardsModuleProps {
  explotacionId: string;
}

export function DashboardsModule({ explotacionId }: DashboardsModuleProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadStats = useCallback(async () => {
    try {
      const [
        { data: tratamientos }, 
        { data: labores }, 
        { data: fertilizaciones },
        { data: costes }
      ] = await Promise.all([
        supabase.from('tratamientos_fitosanitarios').select('dosis, parcelas!inner(explotacion_id)').eq('parcelas.explotacion_id', explotacionId),
        supabase.from('labores').select('id, parcelas!inner(explotacion_id)').eq('parcelas.explotacion_id', explotacionId),
        supabase.from('fertilizaciones').select('dosis, parcelas!inner(explotacion_id)').eq('parcelas.explotacion_id', explotacionId),
        supabase.from('costes').select('importe').eq('explotacion_id', explotacionId)
      ]);

      const totalCoste = costes?.reduce((acc, curr) => acc + Number(curr.importe), 0) || 0;
      const totalFito = tratamientos?.reduce((acc, curr) => acc + Number(curr.dosis), 0) || 0;
      const totalFert = fertilizaciones?.reduce((acc, curr) => acc + Number(curr.dosis), 0) || 0;

      setStats({
        laboresCount: labores?.length || 0,
        costeTotal: totalCoste,
        fitoDosis: totalFito,
        fertDosis: totalFert,
        tratamientosCount: tratamientos?.length || 0,
        fertCount: fertilizaciones?.length || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [explotacionId, supabase]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) return <div className="p-12 text-center text-white/40 animate-pulse">Generando métricas pro...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 pb-6 border-b border-white/5">
        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/10">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight">CXTierra Dashboards (Pro)</h3>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Inteligencia de negocio y reportes operativos</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <GlassCard className="p-6 border-white/5 hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex justify-between items-center mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Activity size={16} />
            </div>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Intervenciones (Labores)</p>
          <div className="text-3xl font-black text-white tracking-tighter">{stats?.laboresCount} <span className="text-xs text-white/30 font-bold uppercase tracking-widest">Operaciones</span></div>
        </GlassCard>

        {/* Metric 2 */}
        <GlassCard className="p-6 border-white/5 hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex justify-between items-center mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Bug size={16} />
            </div>
            <TrendingDown size={14} className="text-emerald-400" />
          </div>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Carga Fitosanitaria (Total)</p>
          <div className="text-3xl font-black text-white tracking-tighter">{stats?.fitoDosis?.toFixed(1)} <span className="text-xs text-white/30 font-bold uppercase tracking-widest">UD</span></div>
        </GlassCard>

        {/* Metric 3 */}
        <GlassCard className="p-6 border-white/5 hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-violet-500/10 transition-colors" />
          <div className="flex justify-between items-center mb-4">
            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
              <Droplets size={16} />
            </div>
          </div>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Fertilizante Volcado</p>
          <div className="text-3xl font-black text-white tracking-tighter">{stats?.fertDosis?.toFixed(1)} <span className="text-xs text-white/30 font-bold uppercase tracking-widest">kg/L</span></div>
        </GlassCard>

        {/* Metric 4 */}
        <GlassCard className="p-6 border-white/5 hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-rose-500/10 transition-colors" />
          <div className="flex justify-between items-center mb-4">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <Target size={16} />
            </div>
            <TrendingUp size={14} className="text-rose-400" />
          </div>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Gasto Acumulado (Costes)</p>
          <div className="text-3xl font-black text-white tracking-tighter">{stats?.costeTotal?.toLocaleString('es-ES', { minimumFractionDigits: 2 })} <span className="text-xs text-white/30 font-bold tracking-widest">€</span></div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-8 border-white/5 bg-black/20 flex flex-col items-center justify-center min-h-[300px] relative">
          <BarChart3 className="w-16 h-16 text-white/5 absolute" />
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest z-10 text-center">Gráfico de Histórico de Insumos<br/>(Visualización en Canvas Placeholder)</p>
        </GlassCard>
        
        <GlassCard className="p-8 border-white/5 bg-black/20 flex flex-col items-center justify-center min-h-[300px] relative">
          <Leaf className="w-16 h-16 text-white/5 absolute" />
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest z-10 text-center">Rendimiento Estimado vs Ideal<br/>(Predicción Machine Learning - Demo)</p>
        </GlassCard>
      </div>
    </div>
  );
}
