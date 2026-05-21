'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

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

async function getEffectiveTenantId(supabase: any, userId: string): Promise<string | null> {
  const { data: userData } = await supabase.from('users').select('tenant_id, platform_role').eq('id', userId).maybeSingle();
  if (!userData) return null;
  
  if (userData.platform_role === 'superadmin') {
    const cookieStore = await cookies();
    return cookieStore.get('x-impersonate-tenant')?.value || null;
  }
  
  return userData.tenant_id || null;
}

export async function getHarvestIntakes() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const tenantId = await getEffectiveTenantId(supabase, user.id);
  if (!tenantId) return []; // Gracefully return empty array if no active tenant context

  const { data, error } = await supabase
    .from('harvest_intakes')
    .select(`
      *,
      farmer:users!harvest_intakes_farmer_id_fkey(email)
    `)
    .eq('tenant_id', tenantId)
    .order('fecha', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createHarvestIntake(intake: {
  farmer_id: string;
  cantidad_kg: number;
  variedad?: string;
  calidad?: string;
  acidez?: number;
  rendimiento_graso?: number;
  lote?: string;
  albaran?: string;
}) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const tenantId = await getEffectiveTenantId(supabase, user.id);
  if (!tenantId) throw new Error('No active cooperative context');
  
  const { error } = await supabase
    .from('harvest_intakes')
    .insert([
      { 
        ...intake, 
        tenant_id: tenantId
      }
    ]);

  if (error) throw error;
  revalidatePath('/tenant/harvests');
  return { success: true };
}
