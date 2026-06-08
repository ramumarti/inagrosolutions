'use server';

import { stripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { TIER_CONFIG, AgriTier } from '@/lib/modules';

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

export async function createCheckoutSession(tier: AgriTier, interval: 'month' | 'year' = 'month') {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Debes iniciar sesión para actualizar tu plan');
  }

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id, tenant_id')
    .eq('id', user.id)
    .single();

  const tenantId = profile?.tenant_id;
  if (!tenantId) {
    throw new Error('No tienes una organización/tenant asociado');
  }

  // 2. Obtener tenant y Connect info + is_white_label
  const { data: tenant } = await adminSupabase
    .from('tenants')
    .select('id, stripe_account_id, stripe_charges_enabled, is_white_label')
    .eq('id', tenantId)
    .single();

  let stripeAccountId: string | null = null;
  let isWhiteLabel = false;
  if (tenant) {
    isWhiteLabel = tenant.is_white_label || false;
    if (tenant.stripe_account_id && tenant.stripe_charges_enabled) {
      stripeAccountId = tenant.stripe_account_id;
    }
  }

  // 3. Calcular precio con descuento de marca blanca
  const tierInfo = TIER_CONFIG[tier];
  if (!tierInfo) {
    throw new Error('Plan no válido');
  }
  let price = interval === 'month' ? tierInfo.price_monthly : tierInfo.price_annual;
  if (isWhiteLabel) {
    price = price * 0.5;
  }

  // 4. Obtener o crear Stripe Customer
  let customerId = profile?.stripe_customer_id;
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

  // 5. Crear Checkout Session
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const sessionParams: any = {
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Inagrosolutions - Plan ${tierInfo.label_es}`,
            description: `Suscripción ${interval === 'year' ? 'Anual' : 'Mensual'} - Cuaderno Digital`,
          },
          unit_amount: Math.round(price * 100),
          recurring: {
            interval: interval === 'year' ? 'year' : 'month',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${siteUrl}/cuaderno?payment=success&upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cuaderno/suscripcion?upgrade=cancelled`,
    metadata: {
      userId: user.id,
      tenantId: tenantId,
      plan: tier,
      interval: interval === 'year' ? 'year' : 'month',
    },
    subscription_data: {
      metadata: {
        userId: user.id,
        tenantId: tenantId,
      },
    },
    locale: 'es',
    allow_promotion_codes: true,
  };

  if (stripeAccountId) {
    sessionParams.subscription_data.application_fee_percent = 50;
  }

  const session = stripeAccountId
    ? await stripe.checkout.sessions.create(sessionParams, { stripeAccount: stripeAccountId })
    : await stripe.checkout.sessions.create(sessionParams);

  return { url: session.url };
}
