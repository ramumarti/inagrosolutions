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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Tanto SuperAdmin como Tenant Admin pueden regenerar su propio link
    const { data: profile } = await supabase
      .from('users')
      .select('platform_role, tenant_id')
      .eq('id', user.id)
      .single();

    const { tenantId } = await req.json();
    const targetTenantId = tenantId || profile?.tenant_id;

    if (!targetTenantId) {
      return NextResponse.json({ error: 'tenantId es obligatorio' }, { status: 400 });
    }

    // Verificar permisos
    const isSuperAdmin = profile?.platform_role === 'superadmin';
    const isOwnTenant = profile?.platform_role === 'tenant_admin' && profile?.tenant_id === targetTenantId;

    if (!isSuperAdmin && !isOwnTenant) {
      return NextResponse.json({ error: 'Sin permisos para este tenant' }, { status: 403 });
    }

    // Obtener cuenta Connect del tenant
    const adminSupabase = getAdminSupabase();
    const { data: tenant } = await adminSupabase
      .from('tenants')
      .select('id, slug, stripe_account_id')
      .eq('id', targetTenantId)
      .single();

    if (!tenant?.stripe_account_id) {
      return NextResponse.json(
        { error: 'Este tenant no tiene cuenta Connect. Créala primero con /api/stripe/connect/create-account' },
        { status: 400 }
      );
    }

    // Generar nuevo Account Link
    const accountLink = await stripe.accountLinks.create({
      account: tenant.stripe_account_id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://inagrosolutions.com'}/superadmin/tenants?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://inagrosolutions.com'}/superadmin/tenants?onboarding=complete&tenant=${tenant.slug}`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });

  } catch (error: any) {
    console.error('[STRIPE_CONNECT] Error generando Account Link:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}
