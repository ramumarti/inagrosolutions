"use client";

import React, { useEffect, useState } from 'react';
import { Users, Activity, MousePointerClick, DollarSign, Plus, FileText, Settings, Leaf, Sprout, Map, ClipboardCheck } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { BarChart, LineChart } from '@/components/dashboard/CssChart';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { GlowButton } from '@/components/ui/GlowButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { NotebookHero } from '@/components/dashboard/NotebookHero';
import { DailyActivity } from '@/components/agriculture/DailyActivity';
import { ModuleGrid } from '@/components/agriculture/ModuleGrid';
import { useI18n } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';

function getGreeting(language: 'en' | 'es'): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) {
    return { text: language === 'en' ? 'Good morning' : 'Buenos días', emoji: '☀️' };
  } else if (hour < 18) {
    return { text: language === 'en' ? 'Good afternoon' : 'Buenas tardes', emoji: '🌤️' };
  } else {
    return { text: language === 'en' ? 'Good evening' : 'Buenas noches', emoji: '🌙' };
  }
}

export default function DashboardPage() {
  const { language, t } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [greeting, setGreeting] = useState<{ text: string; emoji: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    loadUser();
    setGreeting(getGreeting(language));
  }, [supabase, language]);

  const firstName = user?.user_metadata?.first_name || 'Admin';

  const mockBarData = [
    { label: 'Mon', value: 40, max: 100 },
    { label: 'Tue', value: 65, max: 100 },
    { label: 'Wed', value: 45, max: 100 },
    { label: 'Thu', value: 80, max: 100 },
    { label: 'Fri', value: 95, max: 100 },
    { label: 'Sat', value: 55, max: 100 },
    { label: 'Sun', value: 30, max: 100 },
  ];

  const mockLineData = [20, 35, 25, 60, 45, 80, 75, 95, 85, 110];

  const mockTimeline = [
    { id: '1', content: t('dashboard.activity1'), time: t('dashboard.time1'), iconType: 'user' as const },
    { id: '2', content: t('dashboard.activity2'), time: t('dashboard.time2'), iconType: 'server' as const },
    { id: '3', content: t('dashboard.activity3'), time: t('dashboard.time3'), iconType: 'database' as const },
  ];

  return (
    <div className="overflow-y-auto p-6 md:p-8 h-full w-full">
      <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-10 relative z-20">
        
        {/* Personalized Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {greeting?.emoji} {greeting?.text}, {firstName}
          </h1>
          <p className="text-slate-400 mt-1">
            {language === 'en' ? 'What will you create today?' : '¿Qué vas a crear hoy?'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <GlowButton variant="primary" className="text-sm py-2">
            <Plus className="w-4 h-4 mr-2" />
            {t('dashboard.action1')}
          </GlowButton>
        </div>
      </div>

      {/* Hero Central: Cuaderno Digital Olivares */}
      <NotebookHero />

      {/* Stats Grid - Agricultura Focus */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Superficie Registrada" 
          value="45,2 ha" 
          icon={<Map className="w-5 h-5 text-emerald-400" />} 
          trend={8.2} 
          trendText="Vs mes anterior" 
        />
        <StatCard 
          title="Tratamientos (2026)" 
          value="12" 
          icon={<Sprout className="w-5 h-5 text-green-400" />} 
          trend={24} 
          trendText="+3 tratamientos este mes" 
        />
        <StatCard 
          title="Eficiencia ROI (Premium)" 
          value="+18.4%" 
          icon={<DollarSign className="w-5 h-5 text-yellow-400" />} 
          trend={2.1} 
          trendText="Mejora en márgenes" 
        />
        <StatCard 
          title="Sincronización SIEX" 
          value="Al día" 
          icon={<Activity className="w-5 h-5 text-blue-400" />} 
          trend={100} 
          trendText="Estado operacional" 
        />
      </div>

      {/* Dashboard Activo: Alertas y Hoy en la parcela */}
      <DailyActivity />

      {/* Grid de Módulos Modulares */}
      <ModuleGrid />

      {/* Bottom section: Trámites rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        {/* Quick Actions / SIEX Control */}
        <GlassCard className="p-8 flex flex-col border border-emerald-500/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
               <FileText className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">SIEX & Tramitaciones</h3>
              <p className="text-white/40 text-xs">Cumple con la normativa PAC 2026 de forma automática.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
            <Link href="/cuaderno/labores/nuevo" className="w-full">
              <GlowButton variant="ghost" className="w-full justify-start py-4 bg-white/[0.03] border-white/5 text-left hover:bg-emerald-500/10 hover:border-emerald-500/30 group">
                <Plus className="w-4 h-4 mr-3 text-emerald-400 group-hover:scale-125 transition-transform" />
                Nueva Labor
              </GlowButton>
            </Link>
            <Link href="/cuaderno/ajustes" className="w-full">
              <GlowButton variant="ghost" className="w-full justify-start py-4 bg-white/[0.03] border-white/5 text-left hover:bg-emerald-500/10 hover:border-emerald-500/30 group">
                <FileText className="w-4 h-4 mr-3 text-amber-500 group-hover:scale-125 transition-transform" />
                Exportar SIEX
              </GlowButton>
            </Link>
          </div>
        </GlassCard>

        {/* Soporte Agrónomo Directo */}
        <GlassCard className="p-8 flex flex-col border border-blue-500/10 bg-blue-500/[0.03]">
          <div className="flex items-center gap-4 mb-8">
             <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20">
                <ClipboardCheck className="w-6 h-6 text-blue-400" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-white tracking-tight">Atención Técnica</h3>
               <p className="text-white/40 text-xs">Consulta tus dudas con nuestros expertos agrónomos.</p>
             </div>
          </div>
          <div className="flex flex-col gap-4">
             <p className="text-sm text-white/60 italic leading-relaxed">
               "Estamos analizando los datos foliares de tus parcelas. Te recomendamos esperar 48h para el abonado nitrogenado según la previsión de lluvias."
             </p>
             <GlowButton variant="primary" className="w-fit text-xs font-black uppercase tracking-widest px-8">
                Abrir Chat Técnico
             </GlowButton>
          </div>
        </GlassCard>
      </div>

      </div>
    </div>
  );
}
