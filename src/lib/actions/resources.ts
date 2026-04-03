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

export async function getWorkers() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
  
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('tenant_id', userData?.tenant_id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createWorker(worker: { nombre: string; nif?: string; especialidad?: string; coste_hora?: number }) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user?.id).single();
  
  const { error } = await supabase
    .from('workers')
    .insert([
      { ...worker, tenant_id: userData?.tenant_id }
    ]);

  if (error) throw error;
  revalidatePath('/cuaderno/recursos');
  return { success: true };
}

export async function getMachinery() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();

  const { data, error } = await supabase
    .from('machinery')
    .select('*')
    .eq('tenant_id', userData?.tenant_id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createMachinery(machine: { nombre: string; matricula?: string; tipo?: string; coste_hora?: number }) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user?.id).single();
  
  const { error } = await supabase
    .from('machinery')
    .insert([
      { ...machine, tenant_id: userData?.tenant_id }
    ]);

  if (error) throw error;
  revalidatePath('/cuaderno/recursos');
  return { success: true };
}
