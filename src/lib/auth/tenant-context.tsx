'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

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
}

export interface AuthUser extends User {
  platform_role: PlatformRole;
  tenant_id: string;
  tenant?: TenantData;
}

interface AuthContextType {
  user: AuthUser | null;
  tenant: TenantData | null;
  isLoading: boolean;
  isSuperadmin: boolean;
  hasRole: (roles: PlatformRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  tenant: null,
  isLoading: true,
  isSuperadmin: false,
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
            tenants (*)
          `)
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        const authUser: AuthUser = {
          ...session.user,
          platform_role: userData?.platform_role as PlatformRole,
          tenant_id: userData?.tenant_id,
        };

        setUser(authUser);
        if (userData?.tenants) {
          setTenant((userData.tenants as unknown) as TenantData);
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
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
