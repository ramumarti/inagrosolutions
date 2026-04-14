"use client";

import { useState, useMemo } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target, 
  Activity, 
  BrainCircuit,
  PieChart,
  BarChart3,
  Calendar
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface AnalyticsProps {
  data: any[];
}

export function AnalyticsDashboard({ data }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState('30d');

  // Simulated metrics based on input data
  const metrics = useMemo(() => [
    { label: 'Eficiencia Operativa', val: '94.2%', trend: '+2.4%', up: true, icon: Zap, color: 'text-emerald-400' },
    { label: 'Carga de Tratamientos', val: '286 L/ha', trend: '-5.1%', up: true, icon: Target, color: 'text-blue-400' },
    { label: 'Ratio Rentabilidad', val: '€ 1.4k/ha', trend: '+12%', up: true, icon: TrendingUp, color: 'text-amber-400' },
  ], []);

  const chartData = [
    { name: 'Ene', cost: 4000, efficiency: 2400 },
    { name: 'Feb', cost: 3000, efficiency: 1398 },
    { name: 'Mar', cost: 2000, efficiency: 9800 },
    { name: 'Abr', cost: 2780, efficiency: 3908 },
    { name: 'May', cost: 1890, efficiency: 4800 },
    { name: 'Jun', cost: 2390, efficiency: 3800 },
    { name: 'Jul', cost: 3490, efficiency: 4300 },
  ];

  return (
    <div className="space-y-6">
       {/* AI Insights Banner */}
       <div className="p-1 px-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-emerald-500/20 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-3xl" />
          <div className="relative z-10 p-6 flex flex-col md:flex-row items-center gap-6">
             <div className="p-4 bg-indigo-500/20 rounded-2xl text-indigo-400 animate-pulse">
                <BrainCircuit size={32} />
             </div>
             <div className="flex-1 space-y-1 text-center md:text-left">
                <h3 className="text-lg font-black text-white glow-text">INAGRO PREDICTIVE AI</h3>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed">
                   Basado en tus <span className="text-white">124 tratamientos</span>, el sistema predice un ahorro del <span className="text-emerald-400">18% en costes de insumos</span> para la próxima campaña si optimizas la dosificación por zonas.
                </p>
             </div>
             <button className="px-6 py-3 bg-[var(--color-primary)] text-[#0a0a0a] font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg">
                Ver Análisis Completo
             </button>
          </div>
       </div>

       {/* KPIs Grid */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((m, i) => (
            <GlassCard key={i} className="p-6 relative group border-white/5 hover:border-white/10 transition-all">
               <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-white/5 ${m.color}`}>
                     <m.icon size={20} />
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-black ${m.up ? 'text-emerald-400' : 'text-red-400'}`}>
                     {m.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                     {m.trend}
                  </div>
               </div>
               <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{m.label}</p>
               <p className="text-3xl font-black text-white">{m.val}</p>
            </GlassCard>
          ))}
       </div>

       {/* Main Charts Area */}
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <GlassCard className="lg:col-span-8 p-8 min-h-[400px]">
             <div className="flex justify-between items-center mb-10">
                <div>
                   <h4 className="text-xl font-bold text-white mb-1">Tendencia de Eficiencia Activa</h4>
                   <p className="text-xs text-white/30 font-medium">Relación entre costes operativos y rendimiento de cultivo</p>
                </div>
                <div className="flex gap-2">
                   {['7d', '30d', '90d'].map(r => (
                     <button 
                       key={r} 
                       onClick={() => setTimeRange(r)}
                       className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${timeRange === r ? 'bg-[var(--color-primary)] text-[#0a0a0a]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                     >
                       {r}
                     </button>
                   ))}
                </div>
             </div>
             
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#ffffff20" 
                        fontSize={10} 
                        fontWeight="bold"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#ffffff20" 
                        fontSize={10} 
                        fontWeight="bold"
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="cost" 
                        stroke="#10B981" 
                        fillOpacity={1} 
                        fill="url(#colorCost)" 
                        strokeWidth={3}
                      />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </GlassCard>

          <GlassCard className="lg:col-span-4 p-8 flex flex-col">
             <h4 className="text-sm font-black text-white/60 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Actividad en Clúster</h4>
             <div className="flex-1 space-y-6">
                {[
                   { label: 'Tratamientos', val: 65, color: '#3b82f6' },
                   { label: 'Fertilización', val: 24, color: '#8b5cf6' },
                   { label: 'Laboreo', val: 11, color: '#f59e0b' }
                ].map((item, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-white/40">{item.label}</span>
                         <span className="text-white">{item.val}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <div 
                           className="h-full transition-all duration-1000" 
                           style={{ width: `${item.val}%`, backgroundColor: item.color }} 
                         />
                      </div>
                   </div>
                ))}
             </div>
             
             <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                   <Calendar size={14} className="text-emerald-400" />
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Peak Activity</span>
                </div>
                <p className="text-xs font-bold text-white/60 italic leading-relaxed">
                   Detectamos una ventana de aplicación óptima entre el 15 y 22 de Mayo basada en clima histórico.
                </p>
             </div>
          </GlassCard>
       </div>
    </div>
  );
}
