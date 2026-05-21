'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, BarChart3, 
  ArrowUpRight, Target, Info, Shovel, ShoppingCart, Tractor
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface RentabilidadModuleProps {
  explotacionId: string;
  campanaId: string | null;
  parcelas: any[];
  onNavigateToCosechas?: () => void;
}

export function RentabilidadModule({ explotacionId, campanaId, parcelas, onNavigateToCosechas }: RentabilidadModuleProps) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalGastos: 0,
    totalIngresos: 0,
    gastoMedioHa: 0,
    parcelasData: [] as any[]
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // En un entorno real haríamos queries agregadas por campaña
      const { data: inventario } = await supabase.from('inventario_insumos').select('*').eq('explotacion_id', explotacionId);
      const { data: cosechas } = await supabase.from('cosechas').select('*').eq('campana_id', campanaId);
      
      // Real calculation for income
      const totalGastos = (inventario || []).reduce((acc, curr) => acc + ((curr.cantidad_inicial - curr.cantidad_actual) * (curr.precio_unitario || 0)), 0);
      const totalIngresos = (cosechas || []).reduce((acc, curr) => {
        const ingresos = curr.ingreso_estimado || (curr.cantidad_kg * Math.max(curr.precio_real || 0, curr.precio_estimado || 0)) || 0;
        return acc + ingresos;
      }, 0);
      
      const totalHa = parcelas.reduce((acc, p) => acc + (p.hectareas || 0), 0);
      const gastoMedioHa = totalHa > 0 ? totalGastos / totalHa : 0;

      // Map parcelas with mock financial data
      const pData = parcelas.map(p => ({
        ...p,
        gasto: Math.random() * 500 * (p.hectareas || 1), // Mock
        ingreso: Math.random() * 1200 * (p.hectareas || 1) // Mock
      })).sort((a, b) => b.gasto - a.gasto);

      setMetrics({ totalGastos, totalIngresos, gastoMedioHa, parcelasData: pData });
      setLoading(false);
    };

    fetchData();
  }, [explotacionId, campanaId, parcelas]);

  if (loading) return <div className="py-20 text-center text-white/20 animate-pulse font-black uppercase tracking-widest">Analizando Rentabilidad...</div>;

  const roi = metrics.totalGastos > 0 ? ((metrics.totalIngresos - metrics.totalGastos) / metrics.totalGastos) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Rentabilidad de Campaña</h2>
          <p className="text-white/50 font-black uppercase tracking-widest text-[10px] mt-1">Análisis económico y desglose de costes por hectárea</p>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6 border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent">
            <div className="p-2 w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4">
                <ShoppingCart className="text-indigo-400" size={20} />
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Gasto Total Insumos</p>
            <h3 className="text-2xl font-black text-white mt-1">{metrics.totalGastos.toFixed(2)} €</h3>
        </GlassCard>

        <GlassCard className="p-6 border-white/5 bg-gradient-to-br from-emerald-500/5 to-transparent">
            <div className="p-2 w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="text-emerald-400" size={20} />
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Ingresos Proyectados</p>
            <h3 className="text-2xl font-black text-white mt-1">{metrics.totalIngresos.toFixed(2)} €</h3>
        </GlassCard>

        <GlassCard className="p-6 border-white/5 bg-gradient-to-br from-blue-500/5 to-transparent">
            <div className="p-2 w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <Target className="text-blue-400" size={20} />
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Coste Medio por Ha</p>
            <h3 className="text-2xl font-black text-white mt-1">{metrics.gastoMedioHa.toFixed(2)} €<span className="text-xs text-white/40 ml-1">/ha</span></h3>
        </GlassCard>

        <GlassCard className={cn("p-6 border-white/5", roi >= 0 ? "bg-emerald-500/5" : "bg-red-500/5")}>
            <div className={cn("p-2 w-10 h-10 rounded-xl flex items-center justify-center mb-4", roi >= 0 ? "bg-emerald-500/10" : "bg-red-500/10")}>
                {roi >= 0 ? <TrendingUp className="text-emerald-400" size={20} /> : <TrendingDown className="text-red-400" size={20} />}
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Retorno Inversión (ROI)</p>
            <h3 className={cn("text-2xl font-black mt-1", roi >= 0 ? "text-emerald-400" : "text-red-400")}>{roi.toFixed(1)} %</h3>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Plot Ranking by Expense */}
        <GlassCard className="p-8 border-white/5">
            <h4 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-indigo-400" />
                Parcelas con mayor inversión
            </h4>
            <div className="space-y-4">
                {metrics.parcelasData.slice(0, 5).map((p, i) => {
                    const max = metrics.parcelasData[0].gasto;
                    const width = (p.gasto / max) * 100;
                    return (
                        <div key={i} className="space-y-1.5 group">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-white/80">{p.nombre}</span>
                                <span className="text-xs font-black text-white">{p.gasto.toFixed(2)} €</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-500 group-hover:bg-indigo-400 transition-all duration-1000" 
                                    style={{ width: `${width}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </GlassCard>

        {/* Financial Health / Suggestions */}
        <div className="space-y-6">
            <GlassCard className="p-8 border-white/5 bg-white/[0.01] flex items-start gap-5">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                    <Info size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Optimización Detectada</h4>
                  <p className="text-xs text-white/40 font-medium leading-relaxed mb-4">
                    Tus gastos en fitosanitarios en la parcela <span className="text-white font-bold">"Olivar Sur"</span> han aumentado un 22% respecto a la campaña anterior. Considera un tratamiento preventivo temprano.
                  </p>
                  <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors inline-flex items-center gap-2">
                    Comparar Histórico <ArrowUpRight size={12} />
                  </button>
                </div>
            </GlassCard>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center space-y-2">
                    <Shovel className="mx-auto text-orange-400" size={24} />
                    <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Maquinaria</h5>
                    <p className="text-lg font-black text-white">450.00 €</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center space-y-2">
                    <Tractor className="mx-auto text-blue-400" size={24} />
                    <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Combustible (Est.)</h5>
                    <p className="text-lg font-black text-white">125.40 €</p>
                </div>
            </div>
        </div>
      </div>
      
      {/* Footer / Action */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-white/40">
                  <DollarSign size={32} />
              </div>
              <div>
                  <h4 className="text-xl font-black text-white">¿Has terminado la recolección?</h4>
                  <p className="text-sm text-white/40 font-medium">Registra los pesajes para calcular el beneficio neto final.</p>
              </div>
          </div>
          <GlowButton className="px-10 py-4 h-auto rounded-2xl font-black uppercase text-xs tracking-widest" onClick={onNavigateToCosechas}>Registrar Cosecha</GlowButton>
      </div>
    </div>
  );
}
