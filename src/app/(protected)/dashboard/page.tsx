'use client';

import React, { useEffect, useState } from 'react';
import { LayoutGrid, Plus, Activity, Boxes, Settings, User as UserIcon, BarChart3, Database, ArrowRight, Sparkles } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    }
    loadUser();
  }, [supabase]);

  const firstName = user?.user_metadata?.first_name || 'Usuario';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="overflow-y-auto p-6 md:p-12 h-full w-full animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-12 pb-32 relative z-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Sistema Operativo</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
              Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">{firstName}</span>
            </h1>
            <p className="text-white/30 mt-4 text-xs font-bold uppercase tracking-[0.2em]">
              Panel de Control Central • <span className="text-white/60 italic">Vercel Enterprise Edition</span>
            </p>
          </div>
          
          <div className="flex gap-4">
             <GlowButton variant="primary" className="px-8 py-3 rounded-xl text-[10px]">
               <Plus size={16} className="mr-2" />
               Nuevo Proyecto
             </GlowButton>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Uso de API', value: '84%', icon: <Activity size={20} />, color: 'indigo' },
            { label: 'Micro-Apps', value: '12', icon: <Boxes size={20} />, color: 'blue' },
            { label: 'Proyectos', value: '3', icon: <LayoutGrid size={20} />, color: 'purple' },
            { label: 'Storage', value: '1.2 GB', icon: <Database size={20} />, color: 'amber' }
          ].map((stat, i) => (
            <GlassCard key={i} className="p-6 border-white/5 hover:bg-white/[0.03] transition-all">
               <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 bg-${stat.color}-500/10 rounded-xl text-${stat.color}-400 border border-${stat.color}-500/10`}>
                     {stat.icon}
                  </div>
                  <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">Activo</span>
               </div>
               <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{stat.label}</div>
               <div className="text-2xl font-black text-white tracking-tight">{stat.value}</div>
            </GlassCard>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              <GlassCard className="p-8 border-white/5 overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-12 opacity-5 -rotate-12 pointer-events-none">
                    <BarChart3 size={150} />
                 </div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">Actividad Reciente</h3>
                 <div className="space-y-6">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 group cursor-pointer hover:px-2 transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
                               <Plus size={18} />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-white mb-0.5">Despliegue de Micro-App #{i+1}</p>
                               <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Hitos de Producción • Jaén Server</p>
                            </div>
                         </div>
                         <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">Hace {i + 2}h</span>
                      </div>
                    ))}
                 </div>
              </GlassCard>

              <GlassCard className="p-8 border-white/5">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Proyectos Favoritos</h3>
                    <button className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] hover:text-white transition-colors">Ver Todos</button>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                       <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-4 font-black text-lg">C</div>
                       <p className="font-black text-white mb-1">CRM Corporativo</p>
                       <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">v1.2.4 • En Linea</p>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                       <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-4 font-black text-lg">P</div>
                       <p className="font-black text-white mb-1">Portal de Pagos</p>
                       <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">v0.9.8 • Testing</p>
                    </div>
                 </div>
              </GlassCard>
           </div>

           <div className="lg:col-span-1 space-y-8">
              <GlassCard className="p-8 border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-600 p-[1px]">
                       <div className="w-full h-full bg-[#0a0a1a] rounded-[15px] flex items-center justify-center text-white">
                          <UserIcon size={24} />
                       </div>
                    </div>
                    <div>
                       <p className="font-black text-white leading-none mb-1">{firstName}</p>
                       <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Plan Professional</p>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <Link href="/profile" className="block">
                       <button className="w-full py-4 px-6 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center justify-between">
                          Mi Perfil <Settings size={14} />
                       </button>
                    </Link>
                    <Link href="/plans" className="block">
                       <button className="w-full py-4 px-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500/20 transition-all flex items-center justify-between">
                          Mejorar Plan <ArrowRight size={14} />
                       </button>
                    </Link>
                 </div>
              </GlassCard>

              <GlassCard className="p-10 bg-indigo-600 text-white border-0 shadow-2xl shadow-indigo-900/40 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                 <Sparkles className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
                 <h4 className="text-xl font-black uppercase tracking-tight mb-4 relative z-10">¿Necesitas Ayuda Experta?</h4>
                 <p className="text-xs font-medium text-white/80 leading-relaxed mb-8 relative z-10">
                    Nuestro equipo de ingenieros SaaS está disponible 24/7 para ayudarte con la integración de tus micro-aplicaciones.
                 </p>
                 <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all relative z-10 shadow-lg">
                    Contactar Soporte
                 </button>
              </GlassCard>
           </div>
        </div>

      </div>
    </div>
  );
}
