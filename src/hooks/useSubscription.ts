"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type SubscriptionTier = 'basic' | 'advanced' | 'professional' | 'premium';

export interface ModuleAccess {
  siex: boolean;
  mapa: boolean;
  parcelas: boolean;
  costes: boolean;
  trazabilidad: boolean;
  dashboards: boolean;
  sensores: boolean;
}

const TIER_ACCESS: Record<SubscriptionTier, ModuleAccess> = {
  basic: {
    siex: false,
    mapa: false,
    parcelas: true,
    costes: false,
    trazabilidad: false,
    dashboards: false,
    sensores: false
  },
  advanced: {
    siex: true,
    mapa: true,
    parcelas: true,
    costes: false,
    trazabilidad: false,
    dashboards: false,
    sensores: false
  },
  professional: {
    siex: true,
    mapa: true,
    parcelas: true,
    costes: true,
    trazabilidad: true,
    dashboards: true,
    sensores: false
  },
  premium: {
    siex: true,
    mapa: true,
    parcelas: true,
    costes: true,
    trazabilidad: true,
    dashboards: true,
    sensores: true
  }
};

export function useSubscription() {
  const [tier, setTier] = useState<SubscriptionTier>('basic');
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
        .from('users')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      if (data?.subscription_tier) {
        // Mapear el slug de la DB si es necesario, o usarlo directamente
        // Asumimos que los slugs de los nuevos planes coinciden o mapeamos:
        const t = data.subscription_tier.toLowerCase().includes('premium') ? 'premium' :
                  data.subscription_tier.toLowerCase().includes('profesional') ? 'professional' :
                  data.subscription_tier.toLowerCase().includes('avanzado') ? 'advanced' : 'basic';
        
        setTier(t as SubscriptionTier);
      }
      setLoading(false);
    }
    loadSubscription();
  }, [supabase]);

  return {
    tier,
    access: TIER_ACCESS[tier],
    loading,
    isAdmin: false, // Podría expandirse
  };
}
