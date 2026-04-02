'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AgriTier, ModuloSistema } from '@/lib/modules';
import { canAccessModule, isModuleActive } from '@/lib/modules';

export interface AgriProfile {
  userId: string;
  tier: AgriTier;
  totalHectareas: number;
  modulosActivos: string[];
  onboardedAgri: boolean;
  explotaciones: any[];
  parcelas: any[];
  alertasPendientes: number;
}

export interface ResumenDiario {
  explotacion_id: string;
  nombre_explotacion: string;
  total_parcelas: number;
  total_hectareas: number;
  tratamientos_hoy: number;
  labores_hoy: number;
  alertas_pendientes: number;
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
        .select('agri_tier, total_hectareas, modulos_activos, onboarded_agri')
        .eq('id', user.id)
        .single();

      // Modules
      const { data: modulosData } = await supabase
        .from('modulos_sistema')
        .select('*')
        .order('orden');

      // Explotaciones
      const { data: explotaciones } = await supabase
        .from('explotaciones')
        .select('*, parcelas(*)')
        .eq('user_id', user.id);

      // Resumen (simplified, not using a view directly from client)
      const { data: alertasData } = await supabase
        .from('alertas_cuaderno')
        .select('id')
        .eq('user_id', user.id)
        .eq('leida', false);

      const allParcelas = explotaciones?.flatMap((e: any) => e.parcelas || []) || [];
      const totalHa = allParcelas.reduce((sum: number, p: any) => sum + (Number(p.hectareas) || 0), 0);

      setProfile({
        userId: user.id,
        tier: userData?.agri_tier || 'basico',
        totalHectareas: userData?.total_hectareas || totalHa,
        modulosActivos: userData?.modulos_activos || ['siex', 'fitosanitarios', 'fertilizacion', 'labores', 'parcelas'],
        onboardedAgri: userData?.onboarded_agri || false,
        explotaciones: explotaciones || [],
        parcelas: allParcelas,
        alertasPendientes: alertasData?.length || 0,
      });

      setModulos((modulosData as ModuloSistema[]) || []);

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
    return isModuleActive(slug, profile.modulosActivos, profile.tier, mod.tier_minimo as AgriTier, mod.es_obligatorio);
  }, [profile, modulos]);

  const canAccess = useCallback((tierMinimo: AgriTier) => {
    if (!profile) return false;
    return canAccessModule(profile.tier, tierMinimo);
  }, [profile]);

  return { profile, modulos, resumen, loading, hasModule, canAccess, reload: load };
}
