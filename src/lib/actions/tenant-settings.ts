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

export async function updateTenantBranding(data: { primary_color: string; secondary_color: string; logo_url?: string }) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const { data: userData } = await supabase.from('users').select('tenant_id, platform_role').eq('id', user.id).single();
  if (!userData?.tenant_id || (userData.platform_role !== 'tenant_admin' && userData.platform_role !== 'superadmin')) {
    throw new Error('Forbidden');
  }

  const { error } = await supabase
    .from('tenants')
    .update({ 
      primary_color: data.primary_color,
      secondary_color: data.secondary_color,
      ...(data.logo_url && { logo_url: data.logo_url })
    })
    .eq('id', userData.tenant_id);

  if (error) throw error;
  revalidatePath('/tenant/settings');
  revalidatePath('/cuaderno', 'layout'); // Refresh all protected views
  return { success: true };
}

export async function updateTenantModules(activeModules: string[]) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const { data: userData } = await supabase.from('users').select('tenant_id, platform_role').eq('id', user.id).single();
  if (!userData?.tenant_id || (userData.platform_role !== 'tenant_admin' && userData.platform_role !== 'superadmin')) {
    throw new Error('Forbidden');
  }

  const { error } = await supabase
    .from('tenants')
    .update({ active_modules: activeModules })
    .eq('id', userData.tenant_id);

  if (error) throw error;
  revalidatePath('/tenant/settings');
  revalidatePath('/cuaderno', 'layout');
  return { success: true };
}
