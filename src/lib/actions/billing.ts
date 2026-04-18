'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getTenantBillingDashboard(tenantId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {}
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: profile } = await supabase.from('users').select('platform_role, tenant_id').eq('id', user.id).single();
  if (!profile || (profile.platform_role !== 'superadmin' && profile.tenant_id !== tenantId)) {
    throw new Error('No autorizado');
  }

  const admin = getAdminClient();

  // 1. Obtener estado de cuenta Connect
  const { data: tenant } = await admin
    .from('tenants')
    .select('stripe_account_id, stripe_onboarding_status, stripe_charges_enabled, stripe_payouts_enabled')
    .eq('id', tenantId)
    .single();

  // 2. Transacciones del mes en curso y total
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: transactions } = await admin
    .from('payment_transactions')
    .select('amount_tenant, status, created_at')
    .eq('tenant_id', tenantId)
    .eq('status', 'succeeded');

  let mrr = 0;
  let totalCommissions = 0;
  
  (transactions || []).forEach(tx => {
    totalCommissions += tx.amount_tenant;
    if (new Date(tx.created_at) >= startOfMonth) {
      mrr += tx.amount_tenant;
    }
  });

  // 3. Usuarios activos
  const { count: activeUsers } = await admin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('subscription_status', 'active');

  return {
    connectState: {
      hasAccount: !!tenant?.stripe_account_id,
      status: tenant?.stripe_onboarding_status || 'not_created',
      charges: tenant?.stripe_charges_enabled || false,
      payouts: tenant?.stripe_payouts_enabled || false
    },
    stats: {
      activeUsers: activeUsers || 0,
      monthlyRevenue: mrr / 100, // céntimos a euros
      totalCommissions: totalCommissions / 100
    }
  };
}

export async function getSuperadminBillingStats() {
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll() { return cookieStore.getAll() }, setAll() {} }
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: profile } = await supabase.from('users').select('platform_role').eq('id', user.id).single();
  if (profile?.platform_role !== 'superadmin') throw new Error('No autorizado');

  const admin = getAdminClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Total MRR y Comisiones Platform
  const { data: txs } = await admin.from('payment_transactions').select('amount_platform, status, created_at').eq('status', 'succeeded');
  
  let mrr = 0;
  let totalRevenue = 0;
  
  (txs || []).forEach(tx => {
    totalRevenue += tx.amount_platform;
    if (new Date(tx.created_at) >= startOfMonth) {
      mrr += tx.amount_platform;
    }
  });

  // Cooperativas con Connect
  const { count: connectedTenants } = await admin.from('tenants').select('*', { count: 'exact', head: true }).eq('stripe_charges_enabled', true);
  
  // Agricultores activos
  const { count: paidUsers } = await admin.from('users').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active');
  const { count: totalUsers } = await admin.from('users').select('*', { count: 'exact', head: true }).not('platform_role', 'eq', 'superadmin');

  return {
    mrr: mrr / 100,
    totalRevenue: totalRevenue / 100,
    connectedTenants: connectedTenants || 0,
    paidUsers: paidUsers || 0,
    totalUsers: totalUsers || 0,
    conversionRate: totalUsers ? Math.round(((paidUsers || 0) / (totalUsers)) * 100) : 0
  };
}
