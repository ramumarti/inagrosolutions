'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { getImpersonatedTenantId } from '@/lib/actions/superadmin';

export type PlatformRole = 'superadmin' | 'tenant_admin' | 'technician' | 'farmer' | 'worker';

export interface TenantData {
  id: string;
  name: string;
  slug: string;
  type: 'cooperativa' | 'profesional' | 'empresa_servicios' | 'almazara';
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  subscription_tier: string;
  active_modules: string[];
  custom_domain?: string;
  show_public_page?: boolean;
  public_description?: string;
  contact_email?: string;
  contact_phone?: string;
  hero_title?: string;
  hero_subtitle?: string;
  address?: string;
  social_links?: any;
  legal_notice_url?: string;
  privacy_policy_url?: string;
  terms_url?: string;
  legal_email?: string;
  dpo_name?: string;
  fiscal_cif?: string;
  fiscal_name?: string;
  fiscal_address?: string;
  fiscal_email?: string;
}

export interface AuthUser extends User {
  platform_role: PlatformRole;
  tenant_id: string;
  tenant?: TenantData;
  onboarded_agri: boolean;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  tenant: TenantData | null;
  isLoading: boolean;
  isSuperadmin: boolean;
  onboardedAgri: boolean;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  explotaciones: any[];
  hasRole: (roles: PlatformRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  tenant: null,
  isLoading: true,
  isSuperadmin: false,
  onboardedAgri: false,
  explotaciones: [],
  hasRole: () => false,
});

export const useAuthContext = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setUser(null);
          setTenant(null);
          setIsLoading(false);
          return;
        }

        // Fetch user metadata and tenant info
        const { data: userData, error } = await supabase
          .from('users')
          .select(`
            platform_role,
            tenant_id,
            onboarded_agri,
            stripe_customer_id,
            stripe_subscription_id,
            tenants (*)
          `)
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        let tenantIdToUse = userData?.tenant_id;
        let tenantDataToUse = userData?.tenants;

        // Superadmin Impersonation Logic
        if (userData?.platform_role === 'superadmin') {
          const impersonatedId = await getImpersonatedTenantId();
          if (impersonatedId) {
             const { data: impTenant } = await supabase.from('tenants').select('*').eq('id', impersonatedId).single();
             if (impTenant) {
                tenantIdToUse = impersonatedId;
                tenantDataToUse = impTenant;
             }
          }
        }

        const authUser: AuthUser = {
          ...session.user,
          platform_role: userData?.platform_role as PlatformRole,
          tenant_id: tenantIdToUse,
          onboarded_agri: userData?.onboarded_agri || false,
          stripe_customer_id: userData?.stripe_customer_id,
          stripe_subscription_id: userData?.stripe_subscription_id,
        };

        setUser(authUser);
        if (tenantDataToUse) {
          setTenant((tenantDataToUse as unknown) as TenantData);
        }

      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const hasRole = (roles: PlatformRole[]) => {
    if (!user) return false;
    // Superadmin has all permissions
    if (user.platform_role === 'superadmin') return true;
    return roles.includes(user.platform_role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isLoading,
        isSuperadmin: user?.platform_role === 'superadmin',
        onboardedAgri: user?.onboarded_agri || false,
        stripe_customer_id: user?.stripe_customer_id,
        stripe_subscription_id: user?.stripe_subscription_id,
        explotaciones: [],
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
