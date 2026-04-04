'use client';

import React, { useState, useEffect } from 'react';
import { useAgriProfile } from '@/hooks/useAgriProfile';
import { HoyEnLaParcela } from '@/components/cuaderno/HoyEnLaParcela';
import { AlertasCuaderno } from '@/components/cuaderno/AlertasCuaderno';
import { PrescripcionesCuaderno } from '@/components/cuaderno/PrescripcionesCuaderno';
import { TratamientoForm } from '@/components/cuaderno/TratamientoForm';
import { LaborForm } from '@/components/cuaderno/LaborForm';
import { FertilizacionForm } from '@/components/cuaderno/FertilizacionForm';
import { CostesModule } from '@/components/cuaderno/CostesModule';
import { ExportModule } from '@/components/cuaderno/ExportModule';
import { CalendarioModule } from '@/components/cuaderno/CalendarioModule';
import { TrazabilidadModule } from '@/components/cuaderno/TrazabilidadModule';
import { DashboardsModule } from '@/components/cuaderno/DashboardsModule';
import { SensoresModule } from '@/components/cuaderno/SensoresModule';
import { InventarioModule } from '@/components/cuaderno/InventarioModule';
import { ModuleGate } from '@/components/cuaderno/ModuleGate';
import { ParcelasModule } from '@/components/cuaderno/ParcelasModule';
import { createExplotacion } from '@/lib/actions/agricultural';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { TIER_CONFIG } from '@/lib/modules';
import type { AgriTier } from '@/lib/modules';
import {
  Home, Bug, Leaf, Droplets, Wallet, BarChart3, Link as LinkIcon,
  Radio, MapPin, FileDown, Shield, ArrowRight, Zap, ChevronRight,
  Package, Lock, Settings, Bell, Calendar, Building2
} from 'lucide-react';

type TabKey = 'inicio' | 'tratamientos' | 'fitosanitarios' | 'calendario' | 'labores' | 'fertilizacion' | 'parcelas' | 'costes' | 'cosechas' | 'trazabilidad' | 'dashboards' | 'sensores' | 'alertas' | 'exportacion' | 'inventario';

const ICON_MAP: Record<string, any> = {
  ShieldCheck: Shield, Bug: Bug, Leaf: Leaf, Tractor: Leaf,
  Map: MapPin, Wallet: Wallet, Wheat: Leaf, Link: LinkIcon,
  BarChart3: BarChart3, Radio: Radio, Bell: Bell, FileDown: FileDown,
  Package: Package,
};

export default function CuadernoPage() {
  const { profile, modulos: rawModulos, resumen, loading, hasModule, canAccess, reload } = useAgriProfile();
  const [activeTab, setActiveTab] = useState<TabKey>('inicio');
  const [selectedExplotacionId, setSelectedExplotacionId] = useState<string | null>(null);
  const [selectedCampanaId, setSelectedCampanaId] = useState<string | null>(null);
  const [preSelectedPlotId, setPreSelectedPlotId] = useState<string | null>(null);

  // Initialize selection
  useEffect(() => {
    if (profile?.explotaciones && profile.explotaciones.length > 0 && !selectedExplotacionId) {
      setSelectedExplotacionId(profile.explotaciones[0].id);
    }
  }, [profile, selectedExplotacionId]);

  // Reorder modules: 'parcelas' first, 'exportacion' and 'siex' last
  const modulos = [...rawModulos].sort((a, b) => {
    const getWeight = (slug: string) => {
      if (slug === 'parcelas') return -100;
      if (slug.includes('export') || slug === 'exportacion') return 100;
      if (slug.includes('siex')) return 99;
      return 0;
    };
    return getWeight(a.slug) - getWeight(b.slug);
  });

  const [isAddingExplotacion, setIsAddingExplotacion] = useState(false);
  const [newExplotacionNombre, setNewExplotacionNombre] = useState('');

  const handleCreateExplotacion = async () => {
    if (!newExplotacionNombre) return;
    try {
      const res = await createExplotacion({ nombre: newExplotacionNombre, tenant_id: profile?.tenant_id });
      setIsAddingExplotacion(false);
      setNewExplotacionNombre('');
      reload();
      setSelectedExplotacionId(res.id);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm text-white/70 font-bold uppercase tracking-wide">Cargando Cuaderno Digital...</p>
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

  const tierInfo = TIER_CONFIG[profile.tier as AgriTier];

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
          <PrescripcionesCuaderno userId={profile.userId} />
          <AlertasCuaderno userId={profile.userId} />

          {/* Module Overview Grid */}
          <div>
            <h3 className="text-sm font-extrabold text-white/50 uppercase tracking-wide mb-4">Módulos del Cuaderno</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                    <Icon size={24} className={`mb-3 ${active ? 'text-white/80 group-hover:text-white' : 'text-white/20'} transition-colors`} />
                    <p className="text-sm font-bold text-white/90 leading-tight">{m.nombre_es}</p>
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
                  <p className="text-xl font-black text-white">Plan {tierInfo.label_es}</p>
                  <p className="text-sm text-white/70 font-bold">
                    {profile.totalHectareas.toFixed(1)} ha • {profile.modulosActivos.length} módulos activos
                  </p>
                </div>
              </div>
              {profile.tier !== 'premium' && (
                <a href="/cuaderno/planes" className="flex items-center gap-2 px-5 py-3 bg-white/5 rounded-xl border border-white/10 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 transition-all">
                  Mejorar Plan <ArrowRight size={16} />
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
          return <TratamientoForm parcelas={profile.parcelas} initialParcelaId={preSelectedPlotId || undefined} onSuccess={() => { setActiveTab('inicio'); setPreSelectedPlotId(null); }} />;
        case 'labores':
          return <LaborForm parcelas={profile.parcelas} initialParcelaId={preSelectedPlotId || undefined} onSuccess={() => { setActiveTab('inicio'); setPreSelectedPlotId(null); }} />;
        case 'fertilizacion':
          return <FertilizacionForm parcelas={profile.parcelas} initialParcelaId={preSelectedPlotId || undefined} onSuccess={() => { setActiveTab('inicio'); setPreSelectedPlotId(null); }} />;
        case 'inventario':
          return profile.explotaciones[0] ? (
            <InventarioModule explotacionId={profile.explotaciones[0].id} />
          ) : <p className="text-white/40 text-sm">No hay explotaciones configuradas</p>;
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
              <div className="flex items-center justify-between pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/10">
                    <MapPin className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Gestión de Parcelas</h3>
                    <p className="text-sm text-white/60 font-bold">Importación SIGPAC • Mapas • Campañas</p>
                  </div>
                </div>
              </div>
              
              <ParcelasModule 
                explotacionId={selectedExplotacionId || undefined} 
                parcelas={profile.parcelas.filter(p => p.explotacion_id === selectedExplotacionId)}
                tenantId={profile.tenant_id}
                onAction={(action, payload) => {
                  if (payload?.parcelaId) setPreSelectedPlotId(payload.parcelaId);
                  
                  if (action === 'tratamientos') setActiveTab('fitosanitarios');
                  else if (action === 'labores') setActiveTab('labores');
                  else if (action === 'fertilizacion') setActiveTab('fertilizacion');
                  else if (action === 'inicio') setActiveTab('inicio');
                  else if (action === 'new_farm') setIsAddingExplotacion(true);
                  else setActiveTab(action as TabKey);
                }}
              />
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
          userTier={profile.tier as AgriTier}
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
          <h2 className="text-sm font-extrabold text-white/50 uppercase tracking-widest">Cuaderno Digital</h2>
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
                <Icon size={20} className={activeTab === tab.key ? 'text-emerald-400' : isLocked ? 'text-white/10' : 'text-white/50 group-hover:text-white'} />
                <span className="text-sm font-bold truncate flex-1">{tab.label}</span>
                {isLocked && <Lock size={14} className="text-white/10 shrink-0" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Agricultural Context Header */}
        <div className="sticky top-0 z-30 bg-[var(--color-base-100)]/60 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-none">
            {/* Explotacion Selector */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 shrink-0">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <select 
                className="bg-transparent border-none outline-none text-xs font-black text-white/80 uppercase tracking-widest cursor-pointer"
                value={selectedExplotacionId || ''}
                onChange={e => {
                  if (e.target.value === 'new') setIsAddingExplotacion(true);
                  else setSelectedExplotacionId(e.target.value);
                }}
              >
                {Array.isArray(profile?.explotaciones) && profile?.explotaciones?.map((e: any) => (
                  <option key={e.id} value={e.id} className="bg-[#1a1a1a]">{e.nombre}</option>
                ))}
                <option value="new" className="bg-[#1a1a1a] text-emerald-400 font-bold">+ Nueva Entidad...</option>
              </select>
            </div>

            {/* Campaña Selector */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 shrink-0">
              <Calendar className="w-4 h-4 text-blue-400" />
              <select className="bg-transparent border-none outline-none text-xs font-black text-white/80 uppercase tracking-widest cursor-pointer">
                <option className="bg-[#1a1a1a]">Campaña 2024</option>
                <option className="bg-[#1a1a1a]">Campaña 2023</option>
              </select>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
              <Settings size={16} className="text-white/40" />
            </button>
            <div className="h-6 w-px bg-white/5 mx-2" />
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Estado SIEX: Activo</span>
            </div>
          </div>
        </div>

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
                  <Icon size={18} />
                  <span className="text-sm font-bold truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 md:p-10 max-w-5xl">
          {renderContent()}
        </div>

        {/* Modal Nueva Explotacion */}
        {isAddingExplotacion && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAddingExplotacion(false)} />
            <GlassCard className="max-w-md w-full relative p-8 border-white/10">
              <h3 className="text-xl font-black text-white mb-2">Crear Nueva Explotación</h3>
              <p className="text-sm text-white/40 mb-6 font-bold uppercase tracking-widest">Datos básicos de la entidad agrícola</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Nombre Comercial</label>
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all font-bold"
                    placeholder="Ej: Finca Las Olivas"
                    value={newExplotacionNombre}
                    onChange={e => setNewExplotacionNombre(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button className="px-6 py-3 text-sm font-bold text-white/40" onClick={() => setIsAddingExplotacion(false)}>Cancelar</button>
                  <GlowButton onClick={handleCreateExplotacion}>Registrar</GlowButton>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </main>
    </div>
  );
}
