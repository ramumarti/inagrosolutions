"use client";

import React, { useEffect, useState } from 'react';
import { Users, Activity, MousePointerClick, DollarSign, Plus, FileText, Settings, Leaf, Sprout, Map, ClipboardCheck } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { BarChart, LineChart } from '@/components/dashboard/CssChart';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { GlowButton } from '@/components/ui/GlowButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { NotebookHero } from '@/components/dashboard/NotebookHero';
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

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LineChart title={t('dashboard.revenueTrend')} dataPoints={mockLineData} />
        </div>
        <div className="lg:col-span-1">
          <BarChart title={t('dashboard.userGrowth')} data={mockBarData} />
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <GlassCard className="lg:col-span-1 p-6 flex flex-col max-w-none">
          <h3 className="text-lg font-bold text-white mb-6">Trámites y Gestiones</h3>
          <div className="flex flex-col gap-3 mt-auto">
            <Link href="/cuaderno/labores/nuevo">
              <GlowButton variant="ghost" className="w-full justify-start py-3 bg-white/5 border-transparent text-left hover:bg-white/10 group">
                <ClipboardCheck className="w-4 h-4 mr-3 text-emerald-400" />
                Nueva Labor Agrícola
              </GlowButton>
            </Link>
            <Link href="/cuaderno/ajustes">
              <GlowButton variant="ghost" className="w-full justify-start py-3 bg-white/5 border-transparent text-left hover:bg-white/10 group">
                <FileText className="w-4 h-4 mr-3 text-amber-500" />
                Descargar Cuaderno SIEX
              </GlowButton>
            </Link>
            <Link href="/cuaderno/premium">
              <GlowButton variant="ghost" className="w-full justify-start py-3 bg-white/5 border-transparent text-left hover:bg-white/10 group">
                <Leaf className="w-4 h-4 mr-3 text-cyan-400" />
                Analítica de Rendimiento
              </GlowButton>
            </Link>
          </div>
        </GlassCard>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <ActivityTimeline title={t('dashboard.recentActivity')} items={mockTimeline} />
        </div>
      </div>

      </div>
    </div>
  );
}
