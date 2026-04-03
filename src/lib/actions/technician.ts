'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

export async function getAssignedFarmers() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
  const tenantId = userData?.tenant_id;
  if (!tenantId) throw new Error('No tenant associated');

  // For MVP, if they are a technician, maybe they see all farmers in their tenant, or we check the assignments table if we implemented it fully.
  // For now, let's just fetch all users with role 'farmer' in this tenant.
  const { data, error } = await supabase
    .from('users')
    .select(`
      id, email,
      explotaciones:explotaciones(count)
    `)
    .eq('tenant_id', tenantId)
    .eq('platform_role', 'farmer');

  if (error) throw error;
  return data;
}

export async function getTechnicianStats() {
  const farmers = await getAssignedFarmers();
  return {
    totalFarmers: farmers?.length || 0,
    totalAssignedFarms: farmers?.reduce((acc: number, f: any) => acc + (f.explotaciones?.[0]?.count || 0), 0) || 0,
    pendingTasks: 0, // Placeholder
  };
}
