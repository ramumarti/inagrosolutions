'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service key for superadmin actions to bypass RLS if necessary
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {} // Server actions don't set cookies usually
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
  if (!user) throw new Error('Unauthorized');
  
  const { data: userData } = await supabase.from('users').select('platform_role').eq('id', user.id).single();
  if (userData?.platform_role !== 'superadmin') throw new Error('Forbidden');
  
  return true;
}

export async function getPlatformStats() {
  await verifySuperadmin();
  const supabase = await getSupabase();
  
  const [
    { count: totalTenants },
    { count: totalUsers },
    { count: totalFarms },
    { data: activeModules }
  ] = await Promise.all([
    supabase.from('tenants').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('explotaciones').select('*', { count: 'exact', head: true }),
    supabase.from('tenants').select('active_modules')
  ]);

  // Just an example metric
  const mrr = (totalTenants || 0) * 89; 

  return {
    totalTenants: totalTenants || 0,
    totalUsers: totalUsers || 0,
    totalFarms: totalFarms || 0,
    mrr,
  };
}

export async function getTenantsList() {
  await verifySuperadmin();
  const supabase = await getSupabase();
  
  const { data, error } = await supabase
    .from('tenants')
    .select(`
      *,
      users:users(count),
      explotaciones:explotaciones(count)
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function toggleTenantStatus(tenantId: string, isActive: boolean) {
  await verifySuperadmin();
  const supabase = await getSupabase();
  
  const { error } = await supabase
    .from('tenants')
    .update({ is_active: isActive })
    .eq('id', tenantId);
    
  if (error) throw error;
  return { success: true };
}
