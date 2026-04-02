"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type SubscriptionTier = 'starter' | 'professional' | 'enterprise';

export interface ModuleAccess {
  basic_analytics: boolean;
  team_management: boolean;
  api_access: boolean;
  custom_branding: boolean;
  advanced_security: boolean;
  priority_support: boolean;
}

const TIER_ACCESS: Record<SubscriptionTier, ModuleAccess> = {
  starter: {
    basic_analytics: true,
    team_management: false,
    api_access: false,
    custom_branding: false,
    advanced_security: false,
    priority_support: false
  },
  professional: {
    basic_analytics: true,
    team_management: true,
    api_access: true,
    custom_branding: false,
    advanced_security: false,
    priority_support: true
  },
  enterprise: {
    basic_analytics: true,
    team_management: true,
    api_access: true,
    custom_branding: true,
    advanced_security: true,
    priority_support: true
  }
};

export function useSubscription() {
  const [tier, setTier] = useState<SubscriptionTier>('starter');
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
        const t = data.subscription_tier.toLowerCase().includes('enterprise') ? 'enterprise' :
                  data.subscription_tier.toLowerCase().includes('professional') ? 'professional' : 'starter';
        
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
