import { useAuthContext } from './auth/tenant-context';
import type { TenantData } from './auth/tenant-context';

export function useTenant(): {
  tenant: TenantData | null;
  isLoading: boolean;
  theme: {
    primary: string;
    secondary: string;
  };
} {
  const { tenant, isLoading } = useAuthContext();

  return {
    tenant,
    isLoading,
    theme: {
      primary: tenant?.primary_color || '#10B981', // Default emerald
      secondary: tenant?.secondary_color || '#065F46', // Default dark emerald
    }
  };
}
