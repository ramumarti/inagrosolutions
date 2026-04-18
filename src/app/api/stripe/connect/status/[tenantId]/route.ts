import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('platform_role, tenant_id')
      .eq('id', user.id)
      .single();

    // Solo SuperAdmin o el propio Tenant Admin
    const isSuperAdmin = profile?.platform_role === 'superadmin';
    const isOwnTenant = profile?.platform_role === 'tenant_admin' && profile?.tenant_id === tenantId;

    if (!isSuperAdmin && !isOwnTenant) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    // Obtener datos del tenant
    const adminSupabase = getAdminSupabase();
    const { data: tenant } = await adminSupabase
      .from('tenants')
      .select('id, name, stripe_account_id, stripe_onboarding_status, stripe_charges_enabled, stripe_payouts_enabled')
      .eq('id', tenantId)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });
    }

    // Si tiene cuenta Connect, obtener info actualizada de Stripe
    if (tenant.stripe_account_id) {
      try {
        const account = await stripe.accounts.retrieve(tenant.stripe_account_id);

        // Sincronizar estado con la DB si ha cambiado
        const newStatus = account.charges_enabled && account.payouts_enabled
          ? 'completed'
          : account.details_submitted
            ? 'restricted'
            : 'pending';

        if (
          newStatus !== tenant.stripe_onboarding_status ||
          account.charges_enabled !== tenant.stripe_charges_enabled ||
          account.payouts_enabled !== tenant.stripe_payouts_enabled
        ) {
          await adminSupabase
            .from('tenants')
            .update({
              stripe_onboarding_status: newStatus,
              stripe_charges_enabled: account.charges_enabled,
              stripe_payouts_enabled: account.payouts_enabled,
              ...(newStatus === 'completed' && !tenant.stripe_onboarding_status?.includes('completed')
                ? { stripe_onboarding_completed_at: new Date().toISOString() }
                : {}),
            })
            .eq('id', tenantId);
        }

        return NextResponse.json({
          tenantId: tenant.id,
          tenantName: tenant.name,
          stripeAccountId: tenant.stripe_account_id,
          onboardingStatus: newStatus,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          detailsSubmitted: account.details_submitted,
          requirements: account.requirements,
        });
      } catch {
        // Si la cuenta no existe en Stripe, resetear
        return NextResponse.json({
          tenantId: tenant.id,
          tenantName: tenant.name,
          stripeAccountId: tenant.stripe_account_id,
          onboardingStatus: 'error',
          chargesEnabled: false,
          payoutsEnabled: false,
          error: 'No se pudo consultar la cuenta en Stripe',
        });
      }
    }

    // Sin cuenta Connect todavía
    return NextResponse.json({
      tenantId: tenant.id,
      tenantName: tenant.name,
      stripeAccountId: null,
      onboardingStatus: 'not_created',
      chargesEnabled: false,
      payoutsEnabled: false,
    });

  } catch (error: any) {
    console.error('[STRIPE_CONNECT] Error consultando estado:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
