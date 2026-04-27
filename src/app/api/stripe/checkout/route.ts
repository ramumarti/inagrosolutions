import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { TIER_CONFIG, type AgriTier } from '@/lib/modules';

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const { plan, interval, tenantSlug } = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!plan) {
      return NextResponse.json({ error: 'El plan es obligatorio' }, { status: 400 });
    }

    const adminSupabase = getAdminSupabase();
    const tierInfo = TIER_CONFIG[plan as AgriTier];
    if (!tierInfo) {
      return NextResponse.json({ error: 'Plan no válido' }, { status: 400 });
    }

    const amount = interval === 'year' ? tierInfo.price_annual : tierInfo.price_monthly;

    // ── 1. Obtener o crear Stripe Customer ──
    const { data: profile } = await supabase
      .from('users')
      .select('stripe_customer_id, tenant_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    // ── 2. Buscar tenant (cooperativa) y su cuenta Connect ──
    let stripeAccountId: string | null = null;
    let tenantId: string | null = profile?.tenant_id || null;

    if (tenantSlug) {
      const { data: tenant } = await adminSupabase
        .from('tenants')
        .select('id, stripe_account_id, stripe_charges_enabled')
        .eq('slug', tenantSlug)
        .single();

      if (tenant) {
        tenantId = tenant.id;
        if (tenant.stripe_account_id && tenant.stripe_charges_enabled) {
          stripeAccountId = tenant.stripe_account_id;
        }
      }
    } else if (tenantId) {
      const { data: tenant } = await adminSupabase
        .from('tenants')
        .select('id, stripe_account_id, stripe_charges_enabled')
        .eq('id', tenantId)
        .single();

      if (tenant?.stripe_account_id && tenant.stripe_charges_enabled) {
        stripeAccountId = tenant.stripe_account_id;
      }
    }

    // ── 3. Crear Customer en Stripe (en la cuenta correcta si es Direct Charge) ──
    if (!customerId) {
      const customerParams: any = {
        email: user.email!,
        metadata: { supabaseUUID: user.id },
      };

      const customer = stripeAccountId
        ? await stripe.customers.create(customerParams, { stripeAccount: stripeAccountId })
        : await stripe.customers.create(customerParams);

      customerId = customer.id;

      await adminSupabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // ── 4. Crear Checkout Session ──
    const origin = req.nextUrl.origin;

    const sessionParams: any = {
      customer: customerId,
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `InagroSolutions - Plan ${tierInfo.label_es}`,
            description: `Suscripción ${interval === 'year' ? 'Anual' : 'Mensual'} - Cuaderno Digital`,
          },
          unit_amount: Math.round(amount * 100),
          recurring: {
            interval: interval === 'year' ? 'year' : 'month',
          },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${origin}/cuaderno?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cuaderno/suscripcion`,
      metadata: {
        userId: user.id,
        tenantId: tenantId || '',
        plan: plan || '',
        interval: interval || 'month'
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tenantId: tenantId || '',
        },
      },
      locale: 'es',
      allow_promotion_codes: true,
    };

    // ── 5. Si hay cuenta Connect → Direct Charge con application_fee ──
    if (stripeAccountId) {
      sessionParams.subscription_data.application_fee_percent = 50;
    }

    const session = stripeAccountId
      ? await stripe.checkout.sessions.create(sessionParams, { stripeAccount: stripeAccountId })
      : await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error('[STRIPE_CHECKOUT] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
