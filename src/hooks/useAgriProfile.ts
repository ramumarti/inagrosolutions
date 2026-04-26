'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AgriTier, ModuloSistema } from '@/lib/modules';
import { canAccessModule, isModuleActive, TIER_ORDER } from '@/lib/modules';
import { getImpersonatedTenantId } from '@/lib/actions/superadmin';
import type { TenantData } from '@/lib/auth/tenant-context';

export interface AgriProfile {
  userId: string;
  tenant_id?: string;
  platform_role: string;
  first_name?: string;
  onboardedAgri: boolean;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: string;
  subscription_tier?: string;
  explotaciones: any[];
  parcelas: any[];
  campanas: any[];
  alertasPendientes: number;
  tratamientosHoy: number;
  laboresHoy: number;
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
          first_name,
          agri_tier, 
          total_hectareas, 
          modulos_activos, 
          onboarded_agri,
          platform_role,
          tenant_id,
          stripe_customer_id,
          stripe_subscription_id,
          subscription_status,
          subscription_tier,
          tenants (
            id,
            name,
            subscription_tier,
            active_modules,
            logo_url,
            primary_color,
            secondary_color,
            custom_domain,
            slug,
            show_public_page,
            public_description,
            contact_email,
            contact_phone
          )
        `)
        .eq('id', user.id)
        .single();

        let actualTenantId = userData?.tenant_id;
        let actualTenantData = userData?.tenants as any;

        if (userData?.platform_role === 'superadmin') {
           const impId = await getImpersonatedTenantId();
           if (impId) {
             const { data: impTenant } = await supabase.from('tenants').select('*').eq('id', impId).single();
             if (impTenant) {
               actualTenantId = impId;
               actualTenantData = impTenant;
             }
           }
        }

        // --- Fetch Business Logic Data based on Actual Context ---
        const { data: modulosData } = await supabase
          .from('modulos_sistema')
          .select('*')
          .order('orden');

        const { data: explotaciones } = await supabase
          .from('explotaciones')
          .select('*, parcelas(*)')
          .eq(actualTenantId ? 'tenant_id' : 'user_id', actualTenantId || user.id);

        const { data: campanasData } = await supabase
          .from('campanas')
          .select('*')
          .eq(actualTenantId ? 'tenant_id' : 'explotacion_id', actualTenantId ? actualTenantId : (explotaciones?.[0]?.id || ''))
          .order('anio_inicio', { ascending: false });

        const today = new Date().toISOString().split('T')[0];
        const [alertasData, tratsHoy, labsHoy] = await Promise.all([
          supabase.from('alertas_cuaderno').select('id').eq(actualTenantId ? 'tenant_id' : 'user_id', actualTenantId || user.id).eq('leida', false),
          supabase.from('tratamientos_fitosanitarios').select('id', { count: 'exact', head: true }).eq(actualTenantId ? 'tenant_id' : 'user_id', actualTenantId || user.id).gte('fecha', today),
          supabase.from('labores').select('id', { count: 'exact', head: true }).eq(actualTenantId ? 'tenant_id' : 'user_id', actualTenantId || user.id).gte('fecha', today)
        ]);

      const allParcelas = explotaciones?.flatMap((e: any) => e.parcelas || []) || [];
      const totalHa = allParcelas.reduce((sum: number, p: any) => sum + (Number(p.hectareas) || 0), 0);

      // --- Logic: Pick the BEST tier available ---
      // If a farmer pays for 'intermedio' but their coop is 'basico', they should get 'intermedio'.
      // If a farmer is 'basico' but their coop is 'premium', they should get 'premium'.
      const userTier = userData?.agri_tier || 'basico';
      const tenantTier = actualTenantData?.subscription_tier || 'basico';
      
      const userTierIndex = TIER_ORDER.indexOf(userTier as AgriTier);
      const tenantTierIndex = TIER_ORDER.indexOf(tenantTier as AgriTier);
      
      const finalTier = userTierIndex >= tenantTierIndex ? userTier : tenantTier;
      const safeTier = (['basico', 'intermedio', 'avanzado', 'premium'].includes(finalTier) ? finalTier : 'basico') as AgriTier;

      // Merge active modules if both sources provide them
      const userModules = userData?.modulos_activos || [];
      const tenantModules = actualTenantData?.active_modules || [];
      const mergedModules = Array.from(new Set([...userModules, ...tenantModules]));

      setProfile({
        userId: user.id,
        tenant_id: actualTenantId,
        platform_role: userData?.platform_role || 'farmer',
        first_name: userData?.first_name,
        onboardedAgri: userData?.onboarded_agri || false,
        stripe_customer_id: userData?.stripe_customer_id,
        stripe_subscription_id: userData?.stripe_subscription_id,
        subscription_status: userData?.subscription_status,
        subscription_tier: userData?.subscription_tier,
        explotaciones: explotaciones || [],
        parcelas: allParcelas,
        campanas: campanasData || [],
        alertasPendientes: (alertasData?.data as any[])?.length || 0,
        tratamientosHoy: tratsHoy?.count || 0,
        laboresHoy: labsHoy?.count || 0,
        tier: safeTier,
        totalHectareas: totalHa,
        modulosActivos: mergedModules,
        tenant: actualTenantData ? {
          id: actualTenantData.id,
          name: actualTenantData.name,
          logo_url: actualTenantData.logo_url,
          primary_color: actualTenantData.primary_color,
          secondary_color: actualTenantData.secondary_color,
          custom_domain: actualTenantData.custom_domain,
          slug: actualTenantData.slug,
          show_public_page: actualTenantData.show_public_page,
          hero_title: actualTenantData.hero_title,
          hero_subtitle: actualTenantData.hero_subtitle,
          contact_email: actualTenantData.contact_email,
          contact_phone: actualTenantData.contact_phone,
          public_description: actualTenantData.public_description,
          type: actualTenantData.type || 'cooperativa',
          subscription_tier: actualTenantData.subscription_tier,
          active_modules: actualTenantData.active_modules
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
          alertas_pendientes: (alertasData?.data as any[])?.length || 0,
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
