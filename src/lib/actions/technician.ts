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

  // Fetch from assignments table properly
  const { data, error } = await supabase
    .from('technician_assignments')
    .select(`
      farmer:users!technician_assignments_farmer_id_fkey(
        id, email, first_name, last_name, phone,
        explotaciones:explotaciones(count)
      )
    `)
    .eq('tenant_id', tenantId)
    .eq('technician_id', user.id)
    .eq('is_active', true);

  if (error) throw error;
  
  // Extraer un array plano de "farmers"
  const farmersList = data.map((d: any) => d.farmer).filter(Boolean);
  return farmersList;
}

export async function getTechnicianStats() {
  const farmers = await getAssignedFarmers();
  return {
    totalFarmers: farmers?.length || 0,
    totalAssignedFarms: farmers?.reduce((acc: number, f: any) => acc + (f.explotaciones?.[0]?.count || 0), 0) || 0,
    pendingTasks: 0, // Placeholder
  };
}
