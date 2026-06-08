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

export async function verifyAndActivateSubscription(sessionId: string) {
  try {
    if (!sessionId) {
      return { success: false, error: 'Session ID is required' };
    }

    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // 1. Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    if (session.payment_status !== 'paid') {
      return { success: false, error: 'Session is not paid' };
    }

    const sessionUserId = session.metadata?.userId;
    if (sessionUserId !== user.id) {
      return { success: false, error: 'Session user mismatch' };
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const subscriptionId = session.subscription as string;
    let subscription: any = null;
    if (subscriptionId) {
      subscription = await stripe.subscriptions.retrieve(subscriptionId);
    }

    const priceId = subscription?.items?.data?.[0]?.price?.id;
    const interval = subscription?.items?.data?.[0]?.price?.recurring?.interval;

    let planSlug = session.metadata?.plan || 'basico';
    const { data: plan } = await adminSupabase
      .from("plans")
      .select("id, slug")
      .eq("stripe_price_id", priceId)
      .single();

    if (plan) planSlug = plan.slug;

    // Update user
    await adminSupabase.from("users").update({
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      subscription_status: "active",
      subscription_tier: planSlug,
      plan_id: plan?.id || null,
      billing_interval: interval === 'year' ? 'annual' : 'monthly',
      subscription_current_period_end: subscription?.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      subscription_cancel_at_period_end: false,
    }).eq("id", user.id);

    // Also update table subscriptions (legacy)
    if (subscription) {
      await adminSupabase.from("subscriptions").upsert({
        id: subscriptionId,
        user_id: user.id,
        status: "active",
        price_id: priceId,
        quantity: 1,
        cancel_at_period_end: false,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      });
    }

    // Insert payment transaction if it doesn't already exist
    const { data: existingTx } = await adminSupabase
      .from("payment_transactions")
      .select("id")
      .eq("stripe_payment_intent_id", session.payment_intent as string)
      .maybeSingle();

    if (!existingTx && session.payment_intent) {
      const amountTotal = session.amount_total || 0;
      const applicationFee = Math.round(amountTotal * 0.5);

      await adminSupabase.from("payment_transactions").insert({
        user_id: user.id,
        tenant_id: session.metadata?.tenantId || null,
        stripe_payment_intent_id: session.payment_intent as string,
        stripe_invoice_id: session.invoice as string,
        amount_total: amountTotal,
        amount_platform: applicationFee,
        amount_tenant: amountTotal - applicationFee,
        currency: session.currency || 'eur',
        status: 'succeeded',
        billing_interval: interval === 'year' ? 'annual' : 'monthly',
        description: `Suscripción ${planSlug} - ${interval === 'year' ? 'Anual' : 'Mensual'}`,
        metadata: { checkout_session_id: session.id },
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in verifyAndActivateSubscription:', error);
    return { success: false, error: error.message };
  }
}
