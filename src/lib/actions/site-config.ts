'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getSiteConfig() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('site_config').select('*');
  
  if (error) {
    console.error('Error fetching site config:', error);
    return {};
  }

  // Transform to a dictionary
  const configMap: Record<string, any> = {};
  data.forEach((row) => {
    if (!configMap[row.section]) {
      configMap[row.section] = {};
    }
    configMap[row.section][row.key] = row.value;
  });

  return configMap;
}

export async function saveSiteConfig(section: string, key: string, value: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Validate superadmin
  if (!user) return { success: false, error: 'Unauthorized' };
  const { data: userProfile } = await supabase.from('users').select('platform_role').eq('id', user.id).single();
  if (userProfile?.platform_role !== 'superadmin') return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('site_config')
    .upsert(
      { section, key, value, updated_by: user.id, updated_at: new Date().toISOString() },
      { onConflict: 'section, key' }
    );

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/'); // Revalidate the public landing
  return { success: true };
}

export async function getSiteTestimonials() {
  const supabase = await createClient();
  const { data } = await supabase.from('site_testimonials').select('*').order('sort_order');
  return data || [];
}

export async function saveSiteTestimonial(testimonial: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };
  const { data: userProfile } = await supabase.from('users').select('platform_role').eq('id', user.id).single();
  if (userProfile?.platform_role !== 'superadmin') return { success: false, error: 'Unauthorized' };

  const { error } = await supabase.from('site_testimonials').upsert(testimonial);
  if (error) return { success: false, error: error.message };
  
  revalidatePath('/');
  return { success: true };
}

export async function deleteSiteTestimonial(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };
  const { data: userProfile } = await supabase.from('users').select('platform_role').eq('id', user.id).single();
  if (userProfile?.platform_role !== 'superadmin') return { success: false, error: 'Unauthorized' };

  const { error } = await supabase.from('site_testimonials').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  
  revalidatePath('/');
  return { success: true };
}

