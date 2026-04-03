'use client';

import React, { useState } from 'react';
import { useAgriProfile } from '@/hooks/useAgriProfile';
import { HoyEnLaParcela } from '@/components/cuaderno/HoyEnLaParcela';
import { AlertasCuaderno } from '@/components/cuaderno/AlertasCuaderno';
import { TratamientoForm } from '@/components/cuaderno/TratamientoForm';
import { LaborForm } from '@/components/cuaderno/LaborForm';
import { FertilizacionForm } from '@/components/cuaderno/FertilizacionForm';
import { CostesModule } from '@/components/cuaderno/CostesModule';
import { ExportModule } from '@/components/cuaderno/ExportModule';
import { CalendarioModule } from '@/components/cuaderno/CalendarioModule';
import { TrazabilidadModule } from '@/components/cuaderno/TrazabilidadModule';
import { DashboardsModule } from '@/components/cuaderno/DashboardsModule';
import { SensoresModule } from '@/components/cuaderno/SensoresModule';
import { ModuleGate } from '@/components/cuaderno/ModuleGate';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { TIER_CONFIG } from '@/lib/modules';
import type { AgriTier } from '@/lib/modules';
import {
  Home, Bug, Leaf, Droplets, Wallet, BarChart3, Link as LinkIcon,
  Radio, MapPin, FileDown, Shield, ArrowRight, Zap, ChevronRight,
  Package, Lock, Settings, Bell, Calendar
} from 'lucide-react';

type TabKey = 'inicio' | 'tratamientos' | 'fitosanitarios' | 'calendario' | 'labores' | 'fertilizacion' | 'parcelas' | 'costes' | 'cosechas' | 'trazabilidad' | 'dashboards' | 'sensores' | 'alertas' | 'exportacion';

const ICON_MAP: Record<string, any> = {
  ShieldCheck: Shield, Bug: Bug, Leaf: Leaf, Tractor: Leaf,
  Map: MapPin, Wallet: Wallet, Wheat: Leaf, Link: LinkIcon,
  BarChart3: BarChart3, Radio: Radio, Bell: Bell, FileDown: FileDown,
  Package: Package,
};

export default function CuadernoPage() {
  const { profile, modulos, resumen, loading, hasModule, canAccess } = useAgriProfile();
  const [activeTab, setActiveTab] = useState<TabKey>('inicio');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Cargando Cuaderno Digital...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <GlassCard className="p-12 max-w-md text-center space-y-6">
          <Shield className="w-16 h-16 text-red-400/50 mx-auto" />
          <h2 className="text-xl font-black text-white">Acceso Restringido</h2>
          <p className="text-sm text-white/40">Debes iniciar sesión para acceder al Cuaderno Digital</p>
        </GlassCard>
      </div>
    );
  }

  const tierInfo = TIER_CONFIG[profile.tier];

  const tabs = [
    { key: 'inicio' as TabKey, label: 'Inicio', icon: Home, always: true },
    ...modulos.map(m => ({
      key: m.slug as TabKey,
      label: m.nombre_es,
      icon: ICON_MAP[m.icono] || Package,
      always: m.es_obligatorio,
      locked: !hasModule(m.slug),
      tierMinimo: m.tier_minimo as AgriTier,
    })),
  ];

  const renderContent = () => {
    if (activeTab === 'inicio') {
      return (
        <div className="space-y-8">
          {resumen && (
            <HoyEnLaParcela 
              resumen={resumen} 
              alertasPendientes={profile.alertasPendientes} 
              onAction={(tab) => setActiveTab(tab as TabKey)}
            />
          )}
          <AlertasCuaderno userId={profile.userId} />

          {/* Module Overview Grid */}
          <div>
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Módulos del Cuaderno</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {modulos.map(m => {
                const Icon = ICON_MAP[m.icono] || Package;
                const active = hasModule(m.slug);
                return (
                  <button
                    key={m.slug}
                    onClick={() => active && setActiveTab(m.slug as TabKey)}
                    disabled={!active}
                    className={`relative p-5 rounded-xl border text-left transition-all group ${
                      active
                        ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10 cursor-pointer'
                        : 'bg-white/[0.01] border-white/[0.03] opacity-40 cursor-not-allowed'
                    }`}
                  >
                    {!active && (
                      <Lock size={12} className="absolute top-3 right-3 text-white/20" />
                    )}
                    {m.es_obligatorio && (
                      <div className="absolute top-3 right-3">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      </div>
                    )}
                    <Icon size={20} className={`mb-3 ${active ? 'text-white/60 group-hover:text-white' : 'text-white/20'} transition-colors`} />
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">{m.nombre_es}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tier info panel */}
          <GlassCard className={`p-6 border-white/5 bg-gradient-to-r ${tierInfo.gradient}/10`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${tierInfo.gradient} rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg`}>
                  {tierInfo.label_es[0]}
                </div>
                <div>
                  <p className="text-sm font-black text-white">Plan {tierInfo.label_es}</p>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                    {profile.totalHectareas.toFixed(1)} ha • {profile.modulosActivos.length} módulos activos
                  </p>
                </div>
              </div>
              {profile.tier !== 'premium' && (
                <a href="/cuaderno/planes" className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black text-white/50 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all">
                  Mejorar Plan <ArrowRight size={12} />
                </a>
              )}
            </div>
          </GlassCard>
        </div>
      );
    }

    // Modular content
    if (activeTab === 'calendario') {
      return profile.explotaciones[0] ? (
        <CalendarioModule explotacionId={profile.explotaciones[0].id} />
      ) : <p className="text-white/40 text-sm">No hay explotaciones configuradas</p>;
    }

    const mod = modulos.find(m => m.slug === activeTab);
    if (!mod) return null;

    const isActive = hasModule(activeTab);

    const content = (() => {
      switch (activeTab) {
        case 'fitosanitarios':
          return <TratamientoForm parcelas={profile.parcelas} onSuccess={() => setActiveTab('inicio')} />;
        case 'labores':
          return <LaborForm parcelas={profile.parcelas} onSuccess={() => setActiveTab('inicio')} />;
        case 'fertilizacion':
          return <FertilizacionForm parcelas={profile.parcelas} onSuccess={() => setActiveTab('inicio')} />;
        case 'costes':
          return profile.explotaciones[0] ? (
            <CostesModule explotacionId={profile.explotaciones[0].id} parcelas={profile.parcelas} />
          ) : <p className="text-white/40 text-sm">No hay explotaciones configuradas</p>;
        case 'cosechas':
        case 'trazabilidad':
          return profile.explotaciones[0] ? (
            <TrazabilidadModule explotacionId={profile.explotaciones[0].id} parcelas={profile.parcelas} />
          ) : <p className="text-white/40 text-sm">No hay explotaciones configuradas</p>;
        case 'dashboards':
          return profile.explotaciones[0] ? (
            <DashboardsModule explotacionId={profile.explotaciones[0].id} />
          ) : <p className="text-white/40 text-sm">No hay explotaciones configuradas</p>;
        case 'sensores':
          return profile.explotaciones[0] ? (
            <SensoresModule explotacionId={profile.explotaciones[0].id} parcelas={profile.parcelas} />
          ) : <p className="text-white/40 text-sm">No hay explotaciones configuradas</p>;
        case 'parcelas':
          return (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/10">
                  <MapPin className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Mis Parcelas</h3>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Identificación SIGPAC • Geolocalización</p>
                </div>
              </div>
              {profile.parcelas.length === 0 ? (
                <p className="text-center text-white/20 py-12 text-sm">No hay parcelas registradas</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.parcelas.map((p: any) => (
                    <GlassCard key={p.id} className="p-5 border-white/5 hover:bg-white/[0.03] transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-black text-white text-sm">{p.nombre}</h4>
                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/10">{p.hectareas} ha</span>
                      </div>
                      {p.cultivo && <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{p.cultivo} {p.variedad ? `• ${p.variedad}` : ''}</p>}
                      {p.referencia_sigpac && <p className="text-[9px] text-white/20 mt-1 font-mono">SIGPAC: {p.referencia_sigpac}</p>}
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          );
        case 'exportacion':
          return profile.explotaciones[0] ? (
            <ExportModule explotacionId={profile.explotaciones[0].id} />
          ) : <p className="text-white/40 text-sm">No hay explotaciones configuradas</p>;
        default:
          return (
            <GlassCard className="p-12 text-center space-y-6">
              <Package className="w-16 h-16 text-white/10 mx-auto" />
              <div>
                <h4 className="font-black text-white mb-2">{mod.nombre_es}</h4>
                <p className="text-xs text-white/30">{mod.descripcion_es}</p>
              </div>
              <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Módulo en desarrollo</p>
            </GlassCard>
          );
      }
    })();

    if (!isActive) {
      return (
        <ModuleGate
          isActive={false}
          tierMinimo={mod.tier_minimo as AgriTier}
          moduleName={mod.nombre_es}
          userTier={profile.tier}
        >
          {content}
        </ModuleGate>
      );
    }

    return content;
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Module sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 border-r border-white/5 flex-col py-6 overflow-y-auto">
        <div className="px-4 mb-6">
          <h2 className="text-[10px] font-black text-white/20 uppercase tracking-widest">Cuaderno Digital</h2>
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isLocked = 'locked' in tab && tab.locked;
            return (
              <button
                key={tab.key}
                onClick={() => !isLocked && setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group ${
                  activeTab === tab.key
                    ? 'bg-emerald-500/10 text-white border border-emerald-500/20'
                    : isLocked
                    ? 'text-white/15 cursor-not-allowed border border-transparent'
                    : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={16} className={activeTab === tab.key ? 'text-emerald-400' : isLocked ? 'text-white/10' : 'text-white/30 group-hover:text-white/60'} />
                <span className="text-[10px] font-black uppercase tracking-widest truncate flex-1">{tab.label}</span>
                {isLocked && <Lock size={10} className="text-white/10 shrink-0" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile tabs */}
        <div className="lg:hidden sticky top-0 z-20 bg-[var(--color-base-100)]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {tabs.filter(t => t.always || !('locked' in t) || !t.locked).map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap shrink-0 transition-all ${
                    activeTab === tab.key
                      ? 'bg-emerald-500/10 text-white border border-emerald-500/20'
                      : 'text-white/40 border border-transparent'
                  }`}
                >
                  <Icon size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 md:p-10 max-w-5xl">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
