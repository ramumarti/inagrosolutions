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

export async function getWorkers() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const tenantId = await getEffectiveTenantId(supabase, user.id);
  if (!tenantId) return []; // Gracefully return empty array if no active tenant context

  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createWorker(worker: { nombre: string; nif?: string; especialidad?: string; coste_hora?: number }) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const tenantId = await getEffectiveTenantId(supabase, user.id);
  if (!tenantId) throw new Error('No active cooperative context');
  
  const { error } = await supabase
    .from('workers')
    .insert([
      { ...worker, tenant_id: tenantId }
    ]);

  if (error) throw error;
  revalidatePath('/admin/workers');
  revalidatePath('/cuaderno/recursos');
  return { success: true };
}

export async function updateWorker(id: string, worker: any) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const tenantId = await getEffectiveTenantId(supabase, user.id);
  if (!tenantId) throw new Error('No active cooperative context');

  const { error } = await supabase
    .from('workers')
    .update(worker)
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) throw error;
  revalidatePath('/admin/workers');
  revalidatePath('/cuaderno/recursos');
  return { success: true };
}

export async function deleteWorker(id: string) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const tenantId = await getEffectiveTenantId(supabase, user.id);
  if (!tenantId) throw new Error('No active cooperative context');

  const { error } = await supabase
    .from('workers')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) throw error;
  revalidatePath('/admin/workers');
  revalidatePath('/cuaderno/recursos');
  return { success: true };
}

export async function getMachinery() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const tenantId = await getEffectiveTenantId(supabase, user.id);
  if (!tenantId) return []; // Gracefully return empty array if no active tenant context

  const { data, error } = await supabase
    .from('machinery')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createMachinery(machine: { nombre: string; matricula?: string; tipo?: string; coste_hora?: number }) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const tenantId = await getEffectiveTenantId(supabase, user.id);
  if (!tenantId) throw new Error('No active cooperative context');
  
  const { error } = await supabase
    .from('machinery')
    .insert([
      { ...machine, tenant_id: tenantId }
    ]);

  if (error) throw error;
  revalidatePath('/admin/machinery');
  revalidatePath('/cuaderno/recursos');
  return { success: true };
}

export async function updateMachinery(id: string, machine: any) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const tenantId = await getEffectiveTenantId(supabase, user.id);
  if (!tenantId) throw new Error('No active cooperative context');

  const { error } = await supabase
    .from('machinery')
    .update(machine)
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) throw error;
  revalidatePath('/admin/machinery');
  revalidatePath('/cuaderno/recursos');
  return { success: true };
}

export async function deleteMachinery(id: string) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const tenantId = await getEffectiveTenantId(supabase, user.id);
  if (!tenantId) throw new Error('No active cooperative context');

  const { error } = await supabase
    .from('machinery')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) throw error;
  revalidatePath('/admin/machinery');
  revalidatePath('/cuaderno/recursos');
  return { success: true };
}
