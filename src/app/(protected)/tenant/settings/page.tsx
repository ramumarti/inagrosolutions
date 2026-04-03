'use client';

import React, { useEffect, useState } from 'react';
import { updateTenantBranding, updateTenantModules } from '@/lib/actions/tenant-settings';
import { useTenant } from '@/hooks/useTenant';
import { GlassCard } from '@/components/ui/GlassCard';
import { Palette, Blocks, Save } from 'lucide-react';

const AVAILABLE_MODULES = [
  { id: 'core', label: 'Cuaderno Básico', description: 'Gestión de fincas y parcelas.' },
  { id: 'fitosanitarios', label: 'Tratamientos Fitosanitarios', description: 'Registro de aplicaciones y dosis.' },
  { id: 'fertilizacion', label: 'Fertilización', description: 'Control de abonos y nutrición del suelo.' },
  { id: 'labores', label: 'Labores y Trabajos', description: 'Gestión de horas de maquinaria y operarios.' },
  { id: 'cosechas', label: 'Cosechas y Producción', description: 'Albaranes y rendimientos de recolección.' },
];

export default function TenantSettingsPage() {
  const { tenant, isLoading } = useTenant();
  const [primaryColor, setPrimaryColor] = useState('#10B981');
  const [secondaryColor, setSecondaryColor] = useState('#065F46');
  const [activeModules, setActiveModules] = useState<string[]>(['core']);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tenant && !isLoading) {
      setPrimaryColor(tenant.primary_color || '#10B981');
      setSecondaryColor(tenant.secondary_color || '#065F46');
      setActiveModules(tenant.active_modules || ['core']);
    }
  }, [tenant, isLoading]);

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateTenantBranding({ primary_color: primaryColor, secondary_color: secondaryColor });
      alert('Apariencia guardada correctamente. Puede requerir recargar la página para ver los cambios absolutos.');
    } catch(err) {
      alert('Error guardando apariencia.');
    }
    setSaving(false);
  };

  const handleToggleModule = async (moduleId: string) => {
    const newModules = activeModules.includes(moduleId)
      ? activeModules.filter(id => id !== moduleId)
      : [...activeModules, moduleId];
    
    // Core is always mandatory
    if (moduleId === 'core' && !newModules.includes('core')) return;

    setActiveModules(newModules);
    try {
      await updateTenantModules(newModules);
    } catch(e) {
      console.error(e);
      alert('Error activando módulo.');
    }
  };

  if (isLoading) return <div className="p-8 text-white/50 font-bold animate-pulse">Cargando configuración...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <h2 className="text-2xl font-black text-white glow-text">Configuración Corporativa</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Branding Form */}
        <GlassCard className="p-6 border-white/5 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Identidad Visual</h3>
          </div>
          
          <form onSubmit={handleSaveBranding} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white/70 mb-2">Color Primario de la Plataforma</label>
              <div className="flex gap-4">
                <input 
                  type="color" 
                  value={primaryColor} 
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer bg-transparent border-0"
                />
                <input 
                  type="text" 
                  value={primaryColor} 
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white font-mono"
                />
              </div>
              <p className="text-xs text-white/40 mt-1">Este color se usará en acentos, botones y paneles.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-white/70 mb-2">Color Secundario (Oscuro)</label>
              <div className="flex gap-4">
                <input 
                  type="color" 
                  value={secondaryColor} 
                  onChange={e => setSecondaryColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer bg-transparent border-0"
                />
                <input 
                  type="text" 
                  value={secondaryColor} 
                  onChange={e => setSecondaryColor(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <button disabled={saving} type="submit" className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-colors">
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar Apariencia'}
              </button>
            </div>
          </form>
        </GlassCard>

        {/* Modules Config */}
        <GlassCard className="p-6 border-white/5 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Blocks className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Módulos Activos</h3>
          </div>
          
          <div className="space-y-4">
            {AVAILABLE_MODULES.map(mod => {
              const isActive = activeModules.includes(mod.id);
              const isCore = mod.id === 'core';
              return (
                <div key={mod.id} className="flex items-start gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="pt-1">
                    <input 
                      type="checkbox" 
                      id={mod.id}
                      checked={isActive}
                      disabled={isCore} // Cannot disable core
                      onChange={() => handleToggleModule(mod.id)}
                      className="w-4 h-4 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor={mod.id} className={`font-bold block cursor-pointer ${isActive ? 'text-white' : 'text-white/50'}`}>
                      {mod.label}
                    </label>
                    <p className={`text-xs mt-0.5 ${isActive ? 'text-white/60' : 'text-white/30'}`}>{mod.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-white/30 text-center">Los módulos que desactives ocultarán inmediatamente esas funciones para tus agricultores asociados.</p>
        </GlassCard>
      </div>
    </div>
  );
}
