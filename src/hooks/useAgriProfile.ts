'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AgriTier, ModuloSistema } from '@/lib/modules';
import { canAccessModule, isModuleActive } from '@/lib/modules';

export interface AgriProfile {
  userId: string;
  tenant_id?: string;
  platform_role: string;
  onboardedAgri: boolean;
  explotaciones: any[];
  parcelas: any[];
  campanas: any[];
  alertasPendientes: number;
  tier: string;
  totalHectareas: number;
  modulosActivos: string[];
  tenant?: TenantData;
}

export interface ResumenDiario {
  explotacion_id: string;
  nombre_explotacion: string;
  total_parcelas: number;
  total_hectareas: number;
  tratamientos_hoy: number;
  labores_hoy: number;
  alertas_pendientes: number;
  tenant?: {
    id: string;
    name: string;
    logo_url: string;
    primary_color: string;
    secondary_color: string;
    custom_domain: string;
  };
}

export function useAgriProfile() {
  const [profile, setProfile] = useState<AgriProfile | null>(null);
  const [modulos, setModulos] = useState<ModuloSistema[]>([]);
  const [resumen, setResumen] = useState<ResumenDiario | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // User data
      const { data: userData } = await supabase
        .from('users')
        .select(`
          agri_tier, 
          total_hectareas, 
          modulos_activos, 
          onboarded_agri,
          platform_role,
          tenant_id,
          tenants (
            id,
            name,
            subscription_tier,
            active_modules,
            logo_url,
            primary_color,
            secondary_color,
            custom_domain
          )
        `)
        .eq('id', user.id)
        .single();

      // Modules
      const { data: modulosData } = await supabase
        .from('modulos_sistema')
        .select('*')
        .order('orden');

      // Explotaciones (Con nuevos campos PAC)
      const { data: explotaciones } = await supabase
        .from('explotaciones')
        .select('*, parcelas(*)')
        .eq('user_id', user.id);

      // Campañas
      const { data: campanasData } = await supabase
        .from('campanas')
        .select('*')
        .order('anio_inicio', { ascending: false });

      // Resumen (alertas)
      const { data: alertasData } = await supabase
        .from('alertas_cuaderno')
        .select('id')
        .eq('user_id', user.id)
        .eq('leida', false);

      const allParcelas = explotaciones?.flatMap((e: any) => e.parcelas || []) || [];
      const totalHa = allParcelas.reduce((sum: number, p: any) => sum + (Number(p.hectareas) || 0), 0);

      const tenantData = userData?.tenants as any;
      const rawTier = tenantData?.subscription_tier || userData?.agri_tier || 'basico';
      const safeTier = ['basico', 'intermedio', 'avanzado', 'premium'].includes(rawTier) ? rawTier : 'basico';

      setProfile({
        userId: user.id,
        tenant_id: userData?.tenant_id,
        platform_role: userData?.platform_role || 'farmer',
        onboardedAgri: userData?.onboarded_agri || false,
        explotaciones: explotaciones || [],
        parcelas: allParcelas,
        campanas: campanasData || [],
        alertasPendientes: alertasData?.length || 0,
        tier: safeTier,
        totalHectareas: totalHa,
        modulosActivos: tenantData?.active_modules || userData?.modulos_activos || [],
        tenant: tenantData ? {
          id: tenantData.id,
          name: tenantData.name,
          logo_url: tenantData.logo_url,
          primary_color: tenantData.primary_color,
          secondary_color: tenantData.secondary_color,
          custom_domain: tenantData.custom_domain,
          type: tenantData.type || 'cooperativa',
          subscription_tier: tenantData.subscription_tier,
          active_modules: tenantData.active_modules
        } : undefined
      });

      setModulos(modulosData as ModuloSistema[] || []);

      if (explotaciones && explotaciones.length > 0) {
        setResumen({
          explotacion_id: explotaciones[0].id,
          nombre_explotacion: explotaciones[0].nombre,
          total_parcelas: allParcelas.length,
          total_hectareas: totalHa,
          tratamientos_hoy: 0,
          labores_hoy: 0,
          alertas_pendientes: alertasData?.length || 0,
        });
      }
    } catch (err) {
      console.error('Error loading agri profile:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const hasModule = useCallback((slug: string) => {
    if (!profile) return false;
    const mod = modulos.find(m => m.slug === slug);
    if (!mod) return false;
    return isModuleActive(slug, profile.modulosActivos, profile.tier as any, mod.tier_minimo as AgriTier, mod.es_obligatorio);
  }, [profile, modulos]);

  const canAccess = useCallback((tierMinimo: AgriTier) => {
    if (!profile) return false;
    return canAccessModule(profile.tier as any, tierMinimo);
  }, [profile]);

  return { 
    profile, 
    tenant: profile?.tenant,
    modulos, 
    resumen, 
    loading, 
    hasModule, 
    canAccess, 
    reload: load,
    refreshProfile: load
  };
}
