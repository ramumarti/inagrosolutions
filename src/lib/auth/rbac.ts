import { PlatformRole } from './tenant-context';

export const ROUTES_BY_ROLE: Record<PlatformRole, string> = {
  superadmin: '/superadmin',
  tenant_admin: '/dashboard',
  technician: '/technician',
  farmer: '/cuaderno',
  worker: '/cuaderno', // Workers might have a limited view of the notebook
};

export const ROLE_PERMISSIONS = {
  superadmin: ['all'],
  tenant_admin: [
    'manage_tenant_users',
    'manage_tenant_settings',
    'view_tenant_analytics',
    'view_all_farms',
    'manage_billing'
  ],
  technician: [
    'view_assigned_farms',
    'create_recommendations',
    'create_tasks',
    'view_field_notebook'
  ],
  farmer: [
    'manage_own_farms',
    'view_own_recommendations',
    'complete_tasks',
    'edit_field_notebook'
  ],
  worker: [
    'view_assigned_tasks',
    'complete_tasks'
  ]
};

export function getDashboardRoute(role?: PlatformRole | null): string {
  if (!role) return '/cuaderno';
  return ROUTES_BY_ROLE[role] || '/cuaderno';
}

export function canAccessRoute(pathname: string, role?: PlatformRole | null): boolean {
  if (!role) return false;
  if (role === 'superadmin') return true;
  
  if (pathname.startsWith('/superadmin')) return false;
  
  if (pathname.startsWith('/admin') || pathname === '/dashboard') {
    return role === 'tenant_admin';
  }
  
  if (pathname.startsWith('/technician')) {
    return role === 'technician' || role === 'tenant_admin';
  }

  // Everyone can access the generic notebook, content depends on role/RLS
  return true; 
}
