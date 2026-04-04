'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Admin client that bypasses RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Ensure the caller is actually a superadmin
async function verifySuperadmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll() { return cookieStore.getAll() }, setAll() {} }
  });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isAuthorized: false, error: 'No autenticado' };
  
  const { data: userData } = await supabase.from('users').select('platform_role').eq('id', user.id).single();
  if (userData?.platform_role !== 'superadmin') return { isAuthorized: false, error: 'No tienes permisos de superadmin' };
  
  return { isAuthorized: true };
}

export async function getPlatformStats() {
  const auth = await verifySuperadmin();
  if (!auth.isAuthorized) throw new Error(auth.error);

  const supabase = getAdminClient();
  
  try {
    const [
      { count: totalTenants },
      { count: totalUsers },
      { count: totalFarms }
    ] = await Promise.all([
      supabase.from('tenants').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('explotaciones').select('*', { count: 'exact', head: true })
    ]);

    return {
      totalTenants: totalTenants || 0,
      totalUsers: totalUsers || 0,
      totalFarms: totalFarms || 0,
      mrr: (totalTenants || 0) * 89,
    };
  } catch (err: any) {
    console.error('Error fetching stats:', err);
    return { totalTenants: 0, totalUsers: 0, totalFarms: 0, mrr: 0 };
  }
}

export async function getTenantsList() {
  const auth = await verifySuperadmin();
  if (!auth.isAuthorized) return [];

  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('tenants')
    .select(`
      *,
      users:users(count)
    `)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error listing tenants:', error);
    return [];
  }
  return data;
}

export async function toggleTenantStatus(tenantId: string, isActive: boolean) {
  const auth = await verifySuperadmin();
  if (!auth.isAuthorized) return { success: false, error: auth.error };

  const supabase = getAdminClient();
  
  const { error } = await supabase
    .from('tenants')
    .update({ is_active: isActive })
    .eq('id', tenantId);
    
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function createTenant(data: {
  name: string;
  slug: string;
  type: 'cooperativa' | 'profesional' | 'empresa_servicios' | 'almazara';
  subscription_tier: string;
}) {
  const auth = await verifySuperadmin();
  if (!auth.isAuthorized) return { success: false, error: auth.error };

  const supabase = getAdminClient();
  
  const { data: tenant, error } = await supabase
    .from('tenants')
    .insert([{
      name: data.name,
      slug: data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: data.type,
      subscription_tier: data.subscription_tier,
      primary_color: '#10b981',
      secondary_color: '#0f172a',
      active_modules: ['core', 'cuaderno'],
      is_active: true
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating tenant:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data: tenant };
}

