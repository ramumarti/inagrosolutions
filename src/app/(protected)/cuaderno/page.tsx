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

import { CalendarioModule } from '@/components/cuaderno/CalendarioModule';
import { TrazabilidadModule } from '@/components/cuaderno/TrazabilidadModule';
import { DashboardsModule } from '@/components/cuaderno/DashboardsModule';
import { SensoresModule } from '@/components/cuaderno/SensoresModule';
import { ExcelParcelImporter } from '@/components/cuaderno/ExcelParcelImporter';
import { ExportacionModule } from '@/components/cuaderno/ExportacionModule';
import { RentabilidadModule } from '@/components/cuaderno/RentabilidadModule';
import { InventarioModule } from '@/components/cuaderno/InventarioModule';
import { ModuleGate } from '@/components/cuaderno/ModuleGate';
import { FincasModule } from '@/components/cuaderno/FincasModule';
import { CampanaSelector } from '@/components/cuaderno/CampanaSelector';
import { ParcelasMaster } from '@/components/cuaderno/ParcelasMaster';
import { createExplotacion, createCampana, deleteExplotacion, updateExplotacion } from '@/lib/actions/agricultural';
import { SuccessModal } from '@/components/cuaderno/SuccessModal';
import { GlassCard } from '@/components/ui/GlassCard';
import { AICreditsWidget } from '@/components/cuaderno/AICreditsWidget';
import { AICreditsModal } from '@/components/cuaderno/AICreditsModal';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GlowButton } from '@/components/ui/GlowButton';
import { useToast } from '@/components/ui/Toast';
import { TIER_CONFIG } from '@/lib/modules';
import type { AgriTier } from '@/lib/modules';
import {
  Home, Bug, Leaf, Droplets, Wallet, BarChart3, Link as LinkIcon,
  Radio, MapPin, FileDown, Shield, ArrowRight, Zap, ChevronRight,
  Package, Lock, Settings, Bell, Calendar, Building2, Plus, Globe,
  Tractor, Wheat, Sprout
} from 'lucide-react';

type TabKey = 'inicio' | 'fincas' | 'parcelas' | 'tratamientos' | 'fitosanitarios' | 'calendario' | 'labores' | 'fertilizacion' | 'costes' | 'cosechas' | 'trazabilidad' | 'dashboards' | 'sensores' | 'alertas' | 'exportacion' | 'inventario';

const ICON_MAP: Record<string, any> = {
  ShieldCheck: Shield, Bug: Bug, Leaf: Leaf, Tractor: Tractor,
  Map: MapPin, Wallet: Wallet, Wheat: Wheat, Link: LinkIcon,
  BarChart3: BarChart3, Radio: Radio, Bell: Bell, FileDown: FileDown,
  Package: Package, Sprout: Sprout
};

function CuadernoContent() {
  const { profile, modulos: rawModulos, resumen, loading, hasModule, canAccess, reload } = useAgriProfile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('inicio');
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabKey | null;

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [selectedExplotacionId, setSelectedExplotacionId] = useState<string | null>(null);
  const [selectedCampanaId, setSelectedCampanaId] = useState<string | null>(null);
  const [preSelectedPlotId, setPreSelectedPlotId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editTitular, setEditTitular] = useState('');
  const [editNif, setEditNif] = useState('');
  const [showAICreditsModal, setShowAICreditsModal] = useState(false);

  // Initialize selection
  useEffect(() => {
    if (profile?.explotaciones && profile.explotaciones.length > 0 && !selectedExplotacionId) {
      setSelectedExplotacionId(profile.explotaciones[0].id);
    }
  }, [profile, selectedExplotacionId]);

  // Reorder modules: 'parcelas' first, 'exportacion' and 'siex' last
  const modulos = [...rawModulos].sort((a, b) => {
    const getWeight = (slug: string) => {
      if (slug === 'fincas') return -100;
      if (slug === 'parcelas') return -90;
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

  const handleUpdate = async () => {
    if (!editingId || !editNombre) return;
    try {
      await updateExplotacion(editingId, { 
        nombre: editNombre,
        titular: editTitular,
        nif_cif: editNif
      });
      setEditingId(null);
      reload();
    } catch (err) {
      console.error(err);
    }
  };

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(false);

  const handlePayment = async () => {
    if (!profile) return;
    setIsProcessingPayment(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: profile.tier || 'basico', 
          tenantSlug: profile.tenant?.slug,
          interval: annualBilling ? 'year' : 'month'
        }),
      });
      const data = await response.json();
      if (data.error) {
        toast(data.error, 'error');
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      toast(err.message || "Error al iniciar el pago", 'error');
    } finally {
      setIsProcessingPayment(false);
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

  // -- BLOQUEO POR SUSCRIPCIÓN PENDIENTE --
  const isFarmer = profile.platform_role === 'farmer';
  const subscriptionInactive = profile.subscription_status !== 'active' && profile.subscription_status !== 'trialing';

  if (isFarmer && subscriptionInactive) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[80vh] px-6 text-center animate-in fade-in zoom-in duration-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-30 pointer-events-none" />
        <GlassCard className="p-12 max-w-2xl border-white/10 relative overflow-hidden group">
          {/* Decorative background 3D element effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors" />
          
          <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Zap size={32} className="text-emerald-400 animate-pulse" />
          </div>

          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Bienvenido, {profile.first_name || 'Agricultor'}</h2>
          <p className="text-white/60 mb-8 text-lg font-medium">
            Tu cuenta ha sido creada con éxito en la plataforma. Para comenzar a gestionar tus parcelas y cumplir con el 
            <span className="text-white font-bold"> SIEX (RD 1054/2022)</span>, activa tu suscripción.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Plan Seleccionado</p>
              <p className="text-lg font-black text-white uppercase">{tierInfo.label_es}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Operador SIEX</p>
              <p className="text-lg font-black text-white">{profile.tenant?.name || 'InagroSolutions'}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Toggle Billing */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center p-1 bg-white/5 rounded-full border border-white/10 shrink-0">
                <button 
                  onClick={() => setAnnualBilling(false)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${!annualBilling ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'text-gray-400 hover:text-white'}`}
                >
                  Mensual
                </button>
                <button 
                  onClick={() => setAnnualBilling(true)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${annualBilling ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'text-gray-400 hover:text-white'}`}
                >
                  Anual <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 text-white font-black">-2 MESES</span>
                </button>
              </div>
            </div>

            <GlowButton 
              className="w-full py-4 text-lg font-black uppercase tracking-widest"
              onClick={handlePayment}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? 'Redirigiendo...' : 'Activar mi Cuaderno Ahora'}
            </GlowButton>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest text-center">
              Pago 100% seguro gestionado por Stripe Connect
            </p>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 pt-8 border-t border-white/5 flex justify-center gap-8 opacity-40">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter"><Shield size={14} /> SIEX Compliant</div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter"><Globe size={14} /> European Union</div>
          </div>
        </GlassCard>
      </div>
    );
  }

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
    if (profile.explotaciones.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl border border-emerald-500/10 flex items-center justify-center mb-8 shadow-2xl relative group">
            <Building2 size={40} className="text-emerald-500 group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center animate-bounce">
              <Plus size={14} className="text-[#0a0a0a] font-bold" />
            </div>
          </div>
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Bienvenido al Cuaderno Digital</h2>
          <p className="text-white/40 max-w-sm mb-12 font-bold uppercase tracking-widest text-xs leading-relaxed">
            Para comenzar a gestionar tu actividad agrícola, primero debemos registrar tu explotación o finca.
          </p>
          <GlowButton 
            className="px-12 py-6 text-lg font-black bg-emerald-600 border-none shadow-emerald-500/20"
            onClick={() => setIsAddingExplotacion(true)}
          >
            Registrar Primera Finca
          </GlowButton>
          <div className="mt-16 flex gap-12 opacity-20">
            <div className="flex items-center gap-2 font-black text-[10px] tracking-widest uppercase"><Shield size={14} /> SIEX Ready</div>
            <div className="flex items-center gap-2 font-black text-[10px] tracking-widest uppercase"><Globe size={14} /> SIGPAC Sync</div>
          </div>
        </div>
      );
    }

    if (profile.explotaciones.length > 0 && profile.campanas.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="w-24 h-24 bg-blue-500/10 rounded-3xl border border-blue-500/10 flex items-center justify-center mb-8 shadow-2xl relative group">
            <Calendar size={40} className="text-blue-400 group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Plus size={14} className="text-white font-bold" />
            </div>
          </div>
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Nueva Campaña Agrícola</h2>
          <p className="text-white/40 max-w-sm mb-12 font-bold uppercase tracking-widest text-xs leading-relaxed">
            Tienes fincas registradas, pero aún no has definido una campaña de trabajo. 
            Crea la campaña 2024 para registrar tus actividades.
          </p>
          <GlowButton 
            className="px-12 py-6 text-lg font-black bg-blue-600 border-none shadow-blue-500/20"
            onClick={async () => {
              const currentYear = new Date().getFullYear();
              await createCampana({ 
                nombre: `Campaña ${currentYear}`, 
                anio_inicio: currentYear,
                anio_fin: currentYear,
                explotacion_id: profile.explotaciones[0].id,
                tenant_id: profile.tenant_id
              });
              reload();
            }}
          >
            Activar Campaña {new Date().getFullYear()}
          </GlowButton>
        </div>
      );
    }

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
                <a href="/cuaderno/suscripcion" className="flex items-center gap-2 px-5 py-3 bg-white/5 rounded-xl border border-white/10 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 transition-all">
                  Mejorar Plan <ArrowRight size={16} />
                </a>
              )}
            </div>
          </GlassCard>
        </div>
      );
    }

    if (activeTab === 'fincas') {
      return (
        <FincasModule 
          explotaciones={profile.explotaciones}
          tenantId={profile.tenant_id}
          onRefresh={() => reload()}
          onSelect={(id) => {
            setSelectedExplotacionId(id);
            setActiveTab('inicio');
          }}
        />
      );
    }

    if (activeTab === 'parcelas') {
      return (
        <ParcelasMaster 
          parcelas={profile.parcelas.filter(p => !selectedExplotacionId || p.explotacion_id === selectedExplotacionId)}
          campanaId={selectedCampanaId}
          explotacionId={selectedExplotacionId || ''}
          onAction={(action, id) => {
            if (action === 'new') setIsAddingExplotacion(true);
            else if (action === 'tratamiento') setActiveTab('fitosanitarios');
            else if (action === 'labor') setActiveTab('labores');
          }}
        />
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
          return <TratamientoForm parcelas={profile.parcelas} userProfile={profile} initialParcelaId={preSelectedPlotId || undefined} onSuccess={() => { setActiveTab('inicio'); setPreSelectedPlotId(null); }} />;
        case 'labores':
          return <LaborForm parcelas={profile.parcelas} userProfile={profile} initialParcelaId={preSelectedPlotId || undefined} onSuccess={() => { setActiveTab('inicio'); setPreSelectedPlotId(null); }} />;
        case 'fertilizacion':
          return <FertilizacionForm parcelas={profile.parcelas} userProfile={profile} initialParcelaId={preSelectedPlotId || undefined} onSuccess={() => { setActiveTab('inicio'); setPreSelectedPlotId(null); }} />;
        case 'inventario':
          return profile.explotaciones[0] ? (
            <InventarioModule explotacionId={profile.explotaciones[0].id} />
          ) : <p className="text-white/40 text-sm">No hay explotaciones configuradas</p>;
        case 'costes':
          return (
            <RentabilidadModule 
              explotacionId={selectedExplotacionId || ''}
              campanaId={selectedCampanaId}
              parcelas={profile.parcelas.filter(p => !selectedExplotacionId || p.explotacion_id === selectedExplotacionId)}
            />
          );
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
        case 'exportacion':
          return (
            <ExportacionModule 
              profile={profile}
              explotacionId={selectedExplotacionId}
              campanaId={selectedCampanaId}
            />
          );
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
      <Suspense fallback={null}><SuccessModal /></Suspense>
      <AICreditsModal
        isOpen={showAICreditsModal}
        onClose={() => setShowAICreditsModal(false)}
        creditsRemaining={0}
        creditsNeeded={1}
        featureName="IA"
      />
      {/* The sub-sidebar has been removed on desktop to prevent visual redundancies with the main sidebar. Mobile navigation remains via top horizontal tabs. */}

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
            <CampanaSelector 
              campanas={profile.campanas}
              selectedId={selectedCampanaId}
              onSelect={setSelectedCampanaId}
              className="shrink-0"
            />
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

export default function CuadernoPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-[#050510]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm text-white/70 font-bold uppercase tracking-wide">Cargando Cuaderno...</p>
        </div>
      </div>
    }>
      <CuadernoContent />
    </Suspense>
  );
}
