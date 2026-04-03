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

export async function getTenantTasks() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assigned_to:users!tasks_assigned_to_fkey(email),
      assigned_by:users!tasks_assigned_by_fkey(email)
    `)
    .eq('tenant_id', userData?.tenant_id)
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
  
  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
  
  const { error } = await supabase
    .from('tasks')
    .insert([
      { 
        ...task, 
        tenant_id: userData?.tenant_id,
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
