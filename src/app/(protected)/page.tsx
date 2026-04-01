"use client";

import React, { useEffect, useState } from 'react';
import { Plus, FileText, ClipboardCheck, Settings } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { NotebookHero } from '@/components/dashboard/NotebookHero';
import { ModuleGrid } from '@/components/agriculture/ModuleGrid';
import { ParcelMap } from '@/components/agriculture/ParcelMap';
import { WeatherWidget } from '@/components/agriculture/WeatherWidget';
import { ParcelActivityTimeline } from '@/components/agriculture/ParcelActivityTimeline';
import { useI18n } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/client';
import { SiexConnector } from '@/components/agriculture/SiexConnector';
import { PestAlerts } from '@/components/agriculture/PestAlerts';
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

  const firstName = user?.user_metadata?.first_name || 'Agricultor';

  return (
    <div className="overflow-y-auto p-6 md:p-8 h-full w-full">
      <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-10 relative z-20">
        
        {/* Header con Saludo y Clima */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-black text-white tracking-tight leading-none">
              {greeting?.emoji} {greeting?.text}, <span className="text-emerald-400">{firstName}</span>
            </h1>
            <p className="text-white/30 mt-2 text-sm max-w-md font-medium uppercase tracking-widest">
              Centro de Mando de tu Explotación • <span className="text-white/60">Campaña 2026</span>
            </p>
          </div>
          <div className="lg:col-span-1">
             <div className="flex justify-end gap-3">
                <Link href="/cuaderno/labores/nuevo">
                  <GlowButton variant="primary" className="text-xs py-3 px-6 font-black uppercase tracking-widest">
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Labor
                  </GlowButton>
                </Link>
             </div>
          </div>
        </div>

        {/* Hero Central: Cuaderno Digital Olivares */}
        <NotebookHero />

        {/* Sección Crítica: Mapa y Clima */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ParcelMap className="h-full min-h-[450px]" />
          </div>
          <div className="lg:col-span-1 flex flex-col gap-6">
            <WeatherWidget locationName="Jaén, Andalucía" />
            
            {/* ALERTAS DE PLAGAS */}
            <PestAlerts />
            
            {/* Tarjeta de Soporte Técnico / Alerta IA */}
            <GlassCard className="p-6 border border-amber-500/10 bg-amber-500/[0.03]">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-500/10 p-2 rounded-xl">
                  <ClipboardCheck className="w-5 h-5 text-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Aviso Técnico</h4>
              </div>
              <p className="text-xs text-white/60 italic leading-relaxed mb-4">
                "Previsión de lluvias en 48h. Se recomienda adelantar el abonado nitrogenado en las parcelas de bajo rendimiento para maximizar absorción."
              </p>
              <GlowButton variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest py-3 border-amber-500/20 text-amber-500 hover:bg-amber-500/10">
                Consultar con Agrónomo
              </GlowButton>
            </GlassCard>
          </div>
        </div>

        {/* Grid de Módulos Modulares */}
        <ModuleGrid />

        {/* Sección de Actividad y Tramitación */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32">
          <div className="lg:col-span-2 space-y-12">
            <ParcelActivityTimeline />
          </div>
          
          <div className="lg:col-span-1 space-y-8">
            {/* Nuevo Control SIEX PRO */}
            <SiexConnector />

            {/* Publicidad / Upsell Premium */}
            <GlassCard className="p-8 bg-gradient-to-br from-indigo-900/40 to-emerald-900/20 border border-white/5">
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Pasa a Premium</h4>
              <p className="text-xs text-white/40 leading-relaxed mb-6">
                Accede a mapas térmicos de clorofila y alertas de plagas por satélite cada 5 días.
              </p>
              <Link href="/plans">
                <GlowButton variant="primary" className="w-full text-xs py-3 font-black uppercase tracking-widest">
                  Ver Planes Avanzados
                </GlowButton>
              </Link>
            </GlassCard>
          </div>
        </div>

      </div>
    </div>
  );
}
