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

export async function POST(req: Request) {
  try {
    // 1. Verificar que el usuario es SuperAdmin
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

    // 2. Obtener tenantId del body
    const { tenantId } = await req.json();

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId es obligatorio' }, { status: 400 });
    }

    const isSuperAdmin = profile?.platform_role === 'superadmin';
    const isOwnTenant = profile?.platform_role === 'tenant_admin' && profile?.tenant_id === tenantId;

    if (!isSuperAdmin && !isOwnTenant) {
      return NextResponse.json({ error: 'Solo el SuperAdmin o el Administrador de la cooperativa pueden crear cuentas Connect' }, { status: 403 });
    }

    // 3. Obtener datos del tenant
    const adminSupabase = getAdminSupabase();
    const { data: tenant, error: tenantError } = await adminSupabase
      .from('tenants')
      .select('id, name, slug, stripe_account_id, fiscal_name, fiscal_cif, fiscal_email, contact_email')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });
    }

    // 4. Si ya tiene cuenta Connect, devolver la existente
    if (tenant.stripe_account_id) {
      // Generar nuevo Account Link para retomar el onboarding
      const accountLink = await stripe.accountLinks.create({
        account: tenant.stripe_account_id,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://inagrosolutions.com'}/superadmin/tenants?refresh=true`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://inagrosolutions.com'}/superadmin/tenants?onboarding=complete&tenant=${tenant.slug}`,
        type: 'account_onboarding',
      });

      return NextResponse.json({
        accountId: tenant.stripe_account_id,
        onboardingUrl: accountLink.url,
        isExisting: true,
      });
    }

    // 5. Crear nueva cuenta Connect Express
    const email = tenant.fiscal_email || tenant.contact_email;

    const account = await stripe.accounts.create({
      type: 'express',
      country: 'ES',
      email: email || undefined,
      business_type: 'company',
      company: {
        name: tenant.fiscal_name || tenant.name,
        ...(tenant.fiscal_cif ? { tax_id: tenant.fiscal_cif } : {}),
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        tenant_id: tenant.id,
        tenant_slug: tenant.slug,
        platform: 'inagrosolutions',
      },
      settings: {
        payouts: {
          schedule: {
            interval: 'weekly',
            weekly_anchor: 'monday',
          },
        },
      },
    });

    // 6. Guardar el account ID en la base de datos
    await adminSupabase
      .from('tenants')
      .update({
        stripe_account_id: account.id,
        stripe_onboarding_status: 'pending',
        stripe_charges_enabled: false,
        stripe_payouts_enabled: false,
      })
      .eq('id', tenantId);

    // 7. Generar Account Link para onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://inagrosolutions.com'}/superadmin/tenants?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://inagrosolutions.com'}/superadmin/tenants?onboarding=complete&tenant=${tenant.slug}`,
      type: 'account_onboarding',
    });

    console.log(`[STRIPE_CONNECT] ✅ Cuenta Express creada para ${tenant.name}: ${account.id}`);

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
      isExisting: false,
    });

  } catch (error: any) {
    console.error('[STRIPE_CONNECT] Error creando cuenta:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno al crear cuenta Connect' },
      { status: 500 }
    );
  }
}
