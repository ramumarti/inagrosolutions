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

export async function getHarvestIntakes() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();

  const { data, error } = await supabase
    .from('harvest_intakes')
    .select(`
      *,
      farmer:users!harvest_intakes_farmer_id_fkey(email)
    `)
    .eq('tenant_id', userData?.tenant_id)
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
  
  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
  
  const { error } = await supabase
    .from('harvest_intakes')
    .insert([
      { 
        ...intake, 
        tenant_id: userData?.tenant_id
      }
    ]);

  if (error) throw error;
  revalidatePath('/tenant/harvests');
  return { success: true };
}
