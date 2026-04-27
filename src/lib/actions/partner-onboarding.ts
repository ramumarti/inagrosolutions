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

export async function completePartnerOnboarding(data: {
  slug: string;
  primary_color: string;
  secondary_color?: string;
  logo_url: string;
  public_description?: string;
}) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Check if they already have a tenant
  const { data: userData } = await supabase.from('users').select('tenant_id, platform_role, first_name').eq('id', user.id).single();
  
  if (userData?.tenant_id) {
    throw new Error('El usuario ya tiene una cooperativa asociada.');
  }

  // Ensure they are tenant admin
  if (userData?.platform_role !== 'tenant_admin') {
    throw new Error('El usuario no tiene permisos de partner.');
  }

  const rawMetadata = user.user_metadata || {};
  const companyName = rawMetadata.company_name || `Cooperativa de ${userData.first_name || 'Partner'}`;
  const email = user.email;

  // Insert tenant
  const { data: newTenant, error: insertError } = await supabase.from('tenants').insert({
    name: companyName,
    slug: data.slug,
    primary_color: data.primary_color,
    secondary_color: data.secondary_color || '#3B82F6',
    logo_url: data.logo_url || null,
    contact_email: email,
    contact_phone: rawMetadata.phone || null,
    address: rawMetadata.address || null,
    public_description: data.public_description || null,
    subscription_tier: 'basico', // Default for now
    show_public_page: true,
    active_modules: ['siex', 'fitosanitarios', 'fertilizacion', 'labores', 'parcelas'] // default modules
  }).select('id').single();

  if (insertError) {
    console.error('Error creating tenant:', insertError);
    if (insertError.code === '23505') { // Unique violation
      throw new Error('El enlace personalizado (slug) ya está en uso. Por favor, elige otro.');
    }
    throw new Error('Error al crear la cooperativa.');
  }

  // Update user
  const { error: updateError } = await supabase.from('users').update({
    tenant_id: newTenant.id
  }).eq('id', user.id);

  if (updateError) {
     console.error('Error updating user:', updateError);
     throw new Error('Error al asociar el usuario a la cooperativa.');
  }

  return { success: true, tenant_id: newTenant.id };
}
