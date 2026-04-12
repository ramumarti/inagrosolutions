'use server';

import { stripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';
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

  // Get user's tenant ID
  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
  const tenantId = userData?.tenant_id;
  
  if (!tenantId) {
    throw new Error('No tienes una organización/tenant asociado');
  }

  // Get tenant info for discount
  const { data: tenantData } = await supabase
    .from('tenants')
    .select('is_white_label')
    .eq('id', tenantId)
    .single();
  
  const isWhiteLabel = tenantData?.is_white_label || false;
  const tierInfo = TIER_CONFIG[tier];
  let price = interval === 'month' ? tierInfo.price_monthly : tierInfo.price_annual;
  
  // Apply 50% discount for White Label entities
  if (isWhiteLabel) {
    price = price * 0.5;
  }
  
  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    client_reference_id: tenantId, // Pass the tenant ID to the webhook!
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Inagrosolutions - Plan ${tierInfo.label_es} (${interval === 'month' ? 'Mensual' : 'Anual'})`,
            description: `Acceso para hasta ${tierInfo.max_ha === Infinity ? 'hectáreas ilimitadas' : tierInfo.max_ha + ' hectáreas'}`,
          },
          unit_amount: Math.round(price * 100), // Stripe takes cents
          recurring: {
            interval: interval,
          },
        },
        quantity: 1,
      },
    ],
    // metadata is very useful for webhooks
    metadata: {
      tenant_id: tenantId,
      new_tier: tier,
      billing_interval: interval
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cuaderno?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cuaderno/planes?upgrade=cancelled`,
  });

  return { url: session.url };
}
