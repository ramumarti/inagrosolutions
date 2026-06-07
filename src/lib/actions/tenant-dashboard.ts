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

export async function getTenantDashboardMetrics() {
  const supabase = await getSupabase();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
  const tenantId = userData?.tenant_id;
  if (!tenantId) return { success: false, error: 'No tenant found' };

  const [
    members,
    invites,
    plots,
    alerts,
    billing,
    logs,
    tasks
  ] = await Promise.all([
    supabase.from('users').select('id').eq('tenant_id', tenantId),
    supabase.from('tenant_invitations').select('id').eq('tenant_id', tenantId).is('accepted_at', null),
    supabase.from('parcelas').select('hectareas').eq('tenant_id', tenantId),
    supabase.from('alertas_cuaderno').select('*').eq('tenant_id', tenantId).eq('leida', false),
    supabase.from('tenant_billing').select('*, tenants(subscription_tier)').eq('tenant_id', tenantId).single(),
    supabase.from('audit_log').select('*, users(first_name, last_name)').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(6),
    supabase.from('tasks').select('id, estado, fecha_limite').eq('tenant_id', tenantId).neq('estado', 'completada')
  ]);

  // Calculations
  const totalHa = plots.data?.reduce((acc, p) => acc + (Number(p.hectareas) || 0), 0) || 0;
  
  // Health Logic
  let healthScore = 100;
  const errorAlerts = alerts.data?.filter(a => a.nivel === 'error').length || 0;
  const warningAlerts = alerts.data?.filter(a => a.nivel === 'warning').length || 0;
  const overdueTasks = tasks.data?.filter(t => t.fecha_limite && new Date(t.fecha_limite) < new Date()).length || 0;

  healthScore -= (errorAlerts * 25);
  healthScore -= (warningAlerts * 10);
  healthScore -= (overdueTasks * 5);
  if (healthScore < 0) healthScore = 0;

  let healthLabel = 'Óptima';
  if (healthScore < 30) healthLabel = 'Crítica';
  else if (healthScore < 60) healthLabel = 'Mejorable';
  else if (healthScore < 90) healthLabel = 'Buena';

  // Fetch plan price (assuming we join with plans table if needed, or use TIER_CONFIG)
  // For now let's try to find the plan in the DB
  const tier = billing.data?.tenants?.subscription_tier || 'basico';
  const PLAN_MAP: Record<string, string> = {
    'basico': 'basico_agri',
    'intermedio': 'avanzado_agri',
    'avanzado': 'profesional_agri',
    'premium': 'premium_agri'
  };
  const dbSlug = PLAN_MAP[tier] || tier;
  const { data: planData } = await supabase.from('plans').select('price_monthly').eq('slug', dbSlug).single();

  return {
    success: true,
    data: {
      stats: {
        totalMembers: members.data?.length || 0,
        totalHa,
        pendingInvites: invites.data?.length || 0,
        activeAlerts: alerts.data?.length || 0,
        health: {
          score: healthScore,
          label: healthLabel
        }
      },
      billing: {
        plan: tier,
        price: planData?.price_monthly || 0,
        status: billing.data?.status || 'active'
      },
      recentActivity: logs.data?.map(l => ({
        id: l.id,
        user: l.users?.first_name ? `${l.users.first_name} ${l.users.last_name || ''}` : 'Sistema',
        action: l.action,
        entity: l.entity_type,
        time: l.created_at
      })) || []
    }
  };
}

export async function getTenantAuditLogs() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
  if (!userData?.tenant_id) return [];

  const { data, error } = await supabase
    .from('audit_log')
    .select(`
      *,
      user:users(first_name, last_name, email)
    `)
    .eq('tenant_id', userData.tenant_id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data || [];
}

export async function getTenantFarmers() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
  if (!userData?.tenant_id) return [];

  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      first_name,
      last_name,
      total_hectareas,
      explotaciones(id, nombre)
    `)
    .eq('tenant_id', userData.tenant_id)
    .eq('platform_role', 'farmer')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
