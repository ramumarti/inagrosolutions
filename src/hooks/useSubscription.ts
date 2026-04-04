"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AgriTier, TIER_ORDER, TIER_CONFIG, canAccessModule } from '@/lib/modules';

// Re-exportamos AgriTier como SubscriptionTier para compatibilidad
export type SubscriptionTier = AgriTier;

export interface ModuleAccess {
  basic_analytics: boolean;
  team_management: boolean;
  api_access: boolean;
  custom_branding: boolean;
  advanced_security: boolean;
  priority_support: boolean;
}

const TIER_ACCESS: Record<AgriTier, ModuleAccess> = {
  basico: {
    basic_analytics: true,
    team_management: false,
    api_access: false,
    custom_branding: false,
    advanced_security: false,
    priority_support: false
  },
  intermedio: {
    basic_analytics: true,
    team_management: true,
    api_access: false,
    custom_branding: false,
    advanced_security: false,
    priority_support: false
  },
  avanzado: {
    basic_analytics: true,
    team_management: true,
    api_access: true,
    custom_branding: false,
    advanced_security: true,
    priority_support: true
  },
  premium: {
    basic_analytics: true,
    team_management: true,
    api_access: true,
    custom_branding: true,
    advanced_security: true,
    priority_support: true
  }
};

export function useSubscription() {
  const [tier, setTier] = useState<AgriTier>('basico');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadSubscription() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      if (data?.subscription_tier) {
        const raw = data.subscription_tier.toLowerCase();
        // Intentar mapear directamente, o buscar coincidencia parcial
        const validTier = TIER_ORDER.find(t => raw === t || raw.includes(t));
        setTier(validTier || 'basico');
      }
      setLoading(false);
    }
    loadSubscription();
  }, [supabase]);

  return {
    tier,
    tierLabel: TIER_CONFIG[tier]?.label_es || 'Básico',
    access: TIER_ACCESS[tier],
    loading,
    isAdmin: false,
  };
}
