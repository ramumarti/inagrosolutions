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

export async function createCheckoutSession(tier: AgriTier) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Debes iniciar sesión para actualizar tu plan');
  }

  // Get tenant to map subscription
  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
  const tenantId = userData?.tenant_id;
  
  if (!tenantId) {
    throw new Error('No tienes una organización/tenant asociado');
  }

  const tierInfo = TIER_CONFIG[tier];
  
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
            name: `InagroSolutions - Plan ${tierInfo.label_es}`,
            description: `Acceso para hasta ${tierInfo.max_ha === Infinity ? 'hectáreas ilimitadas' : tierInfo.max_ha + ' hectáreas'}`,
          },
          unit_amount: Math.round(tierInfo.price_monthly * 100), // Stripe takes cents
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    // metadata is very useful for webhooks
    metadata: {
      tenant_id: tenantId,
      new_tier: tier
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cuaderno?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cuaderno/planes?upgrade=cancelled`,
  });

  return { url: session.url };
}
