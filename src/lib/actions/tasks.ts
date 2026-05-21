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

export async function getTenantTasks() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const tenantId = await getEffectiveTenantId(supabase, user.id);
  if (!tenantId) return []; // Gracefully return empty array if no active tenant context

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assigned_to:users!tasks_assigned_to_fkey(email),
      assigned_by:users!tasks_assigned_by_fkey(email)
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createTask(task: {
  titulo: string;
  descripcion?: string;
  tipo: string;
  prioridad: string;
  estado: string;
  assigned_to: string;
}) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const tenantId = await getEffectiveTenantId(supabase, user.id);
  if (!tenantId) throw new Error('No active cooperative context');
  
  const { error } = await supabase
    .from('tasks')
    .insert([
      { 
        ...task, 
        tenant_id: tenantId,
        assigned_by: user.id
      }
    ]);

  if (error) throw error;
  revalidatePath('/technician/tasks');
  return { success: true };
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from('tasks')
    .update({ estado: newStatus })
    .eq('id', taskId);

  if (error) throw error;
  revalidatePath('/technician/tasks');
  return { success: true };
}
