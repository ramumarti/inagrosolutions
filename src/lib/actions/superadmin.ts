'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Admin client that bypasses RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Ensure the caller is actually a superadmin
async function verifySuperadmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll() { return cookieStore.getAll() }, setAll() {} }
  });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isAuthorized: false, error: 'No autenticado' };
  
  const { data: userData } = await supabase.from('users').select('platform_role').eq('id', user.id).single();
  if (userData?.platform_role !== 'superadmin') return { isAuthorized: false, error: 'No tienes permisos de superadmin' };
  
  return { isAuthorized: true };
}

export async function getPlatformStats() {
  const auth = await verifySuperadmin();
  if (!auth.isAuthorized) throw new Error(auth.error);

  const supabase = getAdminClient();
  
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      { count: totalTenants },
      { count: totalUsers },
      { count: totalFarms },
      { data: recentActivity },
      { data: tierStats }
    ] = await Promise.all([
      supabase.from('tenants').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('explotaciones').select('*', { count: 'exact', head: true }),
      supabase.from('audit_log')
        .select(`
          id, 
          action, 
          entity_type, 
          created_at,
          user:users(first_name, last_name, email),
          tenant:tenants(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.from('tenants').select('subscription_tier')
    ]);

    // Calculate MRR from real tiers
    const { data: plans } = await supabase.from('plans').select('slug, price_monthly');
    const priceMap = (plans || []).reduce((acc: any, p) => {
       acc[p.slug] = Number(p.price_monthly) || 0;
       return acc;
    }, {});

    const totalMRR = (tierStats || []).reduce((sum, t) => {
       return sum + (priceMap[t.subscription_tier] || 0);
    }, 0);

    // Fetch activity trend for the last 7 days
    const { data: trendData } = await supabase
      .rpc('get_activity_trend', { days_count: 7 });

    return {
      totalTenants: totalTenants || 0,
      totalUsers: totalUsers || 0,
      totalFarms: totalFarms || 0,
      mrr: totalMRR,
      recentActivity: recentActivity || [],
      trend: trendData || []
    };
  } catch (err: any) {
    console.error('Error fetching stats:', err);
    return { totalTenants: 0, totalUsers: 0, totalFarms: 0, mrr: 0, recentActivity: [], trend: [] };
  }
}

export async function getAuditLogDetail(logId: string) {
  const auth = await verifySuperadmin();
  if (!auth.isAuthorized) throw new Error(auth.error);

  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('id', logId)
    .single();
    
  if (error) throw error;
  return data;
}

export async function getTenantsList() {
  const auth = await verifySuperadmin();
  if (!auth.isAuthorized) return [];

  const supabase = getAdminClient();
  
  const { data, error } = await supabase
    .from('tenants')
    .select(`
      *,
      users:users(count)
    `)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error listing tenants:', error);
    return [];
  }
  return data;
}

export async function toggleTenantStatus(tenantId: string, isActive: boolean) {
  const auth = await verifySuperadmin();
  if (!auth.isAuthorized) return { success: false, error: auth.error };

  const supabase = getAdminClient();
  
  const { error } = await supabase
    .from('tenants')
    .update({ is_active: isActive })
    .eq('id', tenantId);
    
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function createTenant(data: {
  name: string;
  slug: string;
  type: 'cooperativa' | 'profesional' | 'empresa_servicios' | 'almazara';
  subscription_tier: string;
}) {
  const auth = await verifySuperadmin();
  if (!auth.isAuthorized) return { success: false, error: auth.error };

  const supabase = getAdminClient();
  
  const { data: tenant, error } = await supabase
    .from('tenants')
    .insert([{
      name: data.name,
      slug: data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: data.type,
      subscription_tier: data.subscription_tier,
      primary_color: '#10b981',
      secondary_color: '#0f172a',
      active_modules: ['core', 'cuaderno'],
      is_active: true
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating tenant:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data: tenant };
}

export async function switchContext(tenantId: string | null) {
  const auth = await verifySuperadmin();
  if (!auth.isAuthorized) return { success: false, error: auth.error };

  const cookieStore = await cookies();
  
  // SEC-7: Use a secure cookie for impersonation instead of mutating the DB
  if (tenantId) {
    cookieStore.set('x-impersonate-tenant', tenantId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 4 // 4 hours max impersonation session
    });
  } else {
    cookieStore.delete('x-impersonate-tenant');
  }

  return { success: true };
}

export async function deleteTenant(tenantId: string) {
  const auth = await verifySuperadmin();
  if (!auth.isAuthorized) return { success: false, error: auth.error };

  const supabase = getAdminClient();
  
  // Hard delete tenant permanently
  const { error } = await supabase
    .from('tenants')
    .delete()
    .eq('id', tenantId);
  
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getGlobalPlans() {
  const auth = await verifySuperadmin();
  if (!auth.isAuthorized) return [];

  const supabase = getAdminClient();
  const { data } = await supabase.from('plans').select('*').order('sort_order');
  return data || [];
}

export async function updatePlan(id: string, updates: any) {
  const auth = await verifySuperadmin();
  if (!auth.isAuthorized) return { success: false, error: auth.error };

  const supabase = getAdminClient();
  const { error } = await supabase.from('plans').update(updates).eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getGlobalUsers() {
  const auth = await verifySuperadmin();
  if (!auth.isAuthorized) return [];

  const supabase = getAdminClient();
  const { data } = await supabase
    .from('users')
    .select(`
      *,
      tenant:tenants(name)
    `)
    .order('created_at', { ascending: false })
    .limit(100);
  return data || [];
}

export async function rotatePlatformRole(userId: string, newRole: string) {
  const auth = await verifySuperadmin();
  if (!auth.isAuthorized) return { success: false, error: auth.error };

  const supabase = getAdminClient();
  const { error } = await supabase.from('users').update({ platform_role: newRole }).eq('id', userId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function fetchGlobalAuditLogs() {
  const auth = await verifySuperadmin();
  if (!auth.isAuthorized) return [];

  const supabase = getAdminClient();
  const { data } = await supabase
    .from('audit_log')
    .select(`
      *,
      user:users(first_name, last_name, email),
      tenant:tenants(name)
    `)
    .order('created_at', { ascending: false })
    .limit(200);
    
  return data || [];
}

/**
 * SEC-7: Get the impersonated tenant ID from cookie (server-side only)
 * Returns null if no impersonation is active
 */
export async function getImpersonatedTenantId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('x-impersonate-tenant')?.value || null;
}
