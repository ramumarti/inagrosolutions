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

export async function getTenantAssignments() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: actingUser } = await supabase.from('users').select('tenant_id, platform_role').eq('id', user.id).single();
  if (!actingUser || (actingUser.platform_role !== 'tenant_admin' && actingUser.platform_role !== 'superadmin')) {
    throw new Error('Forbidden');
  }

  // Obtenemos técnicos y agricultores del tenant
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, platform_role')
    .eq('tenant_id', actingUser.tenant_id);

  if (usersError) throw usersError;

  // Obtenemos asignaciones
  const { data: assignments, error: assignError } = await supabase
    .from('technician_assignments')
    .select('*')
    .eq('tenant_id', actingUser.tenant_id)
    .eq('is_active', true);

  if (assignError) throw assignError;

  return {
    technicians: users.filter(u => u.platform_role === 'technician'),
    farmers: users.filter(u => u.platform_role === 'farmer'),
    assignments: assignments || []
  };
}

export async function assignFarmerToTechnician(technicianId: string, farmerId: string) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: actingUser } = await supabase.from('users').select('tenant_id, platform_role').eq('id', user.id).single();
  if (!actingUser || (actingUser.platform_role !== 'tenant_admin' && actingUser.platform_role !== 'superadmin')) {
    throw new Error('Forbidden');
  }

  const { error } = await supabase
    .from('technician_assignments')
    .insert({
      tenant_id: actingUser.tenant_id,
      technician_id: technicianId,
      farmer_id: farmerId
    });

  if (error) throw error;
  return { success: true };
}

export async function removeAssignment(assignmentId: string) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: actingUser } = await supabase.from('users').select('tenant_id, platform_role').eq('id', user.id).single();
  if (!actingUser || (actingUser.platform_role !== 'tenant_admin' && actingUser.platform_role !== 'superadmin')) {
    throw new Error('Forbidden');
  }

  const { error } = await supabase
    .from('technician_assignments')
    .delete()
    .eq('id', assignmentId)
    .eq('tenant_id', actingUser.tenant_id);

  if (error) throw error;
  return { success: true };
}
