import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// We must use the service role key to bypass RLS in a webhook!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event;

    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
    } else {
      // For local testing without a webhook secret
      event = JSON.parse(body);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const tenantId = session.metadata?.tenant_id;
      const newTier = session.metadata?.new_tier;

      if (tenantId && newTier) {
        console.log(`Upgrading tenant ${tenantId} to tier ${newTier}`);
        // Actualizar la tabla tenants en Supabase
        const { error } = await supabase
          .from('tenants')
          .update({ 
            subscription_tier: newTier,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription
          })
          .eq('id', tenantId);

        if (error) {
          console.error('Error updating tenant in Supabase:', error);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
      }
    }

    // Additional event types could be handled here (invoice.payment_failed, etc)

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Unhandled webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
