'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { PlatformRole } from '@/lib/auth/tenant-context';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {}
      }
    }
  );
}

export async function getTenantStats() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
  const tenantId = userData?.tenant_id;
  if (!tenantId) throw new Error('No tenant associated');

  const [
    { count: totalUsers },
    { count: totalFarms },
    { count: totalParcels }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('explotaciones').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('parcelas').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId)
  ]);

  return {
    totalUsers: totalUsers || 0,
    totalFarms: totalFarms || 0,
    totalParcels: totalParcels || 0
  };
}

export async function getTenantUsers() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
  const tenantId = userData?.tenant_id;
  if (!tenantId) throw new Error('No tenant associated');

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('tenant_id', tenantId);

  if (error) throw error;
  return data;
}

export async function setTenantUserRole(userId: string, targetRole: PlatformRole) {
  const supabase = await getSupabase();
  
  // Verify acting user is tenant admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const { data: actingUser } = await supabase.from('users').select('tenant_id, platform_role').eq('id', user.id).single();
  if (!actingUser || (actingUser.platform_role !== 'tenant_admin' && actingUser.platform_role !== 'superadmin')) {
    throw new Error('Forbidden');
  }

  // Use service key to bypass RLS for updating other users if necessary, but since they are in same tenant RLS should allow update if policy permits. For safety, server client here has anon/auth context. Let's assume RLS is set to allow Tenant Admin to update users in same tenant.
  const { error } = await supabase
    .from('users')
    .update({ platform_role: targetRole })
    .eq('id', userId)
    .eq('tenant_id', actingUser.tenant_id); // Security boundary

  if (error) throw error;
  return { success: true };
}
