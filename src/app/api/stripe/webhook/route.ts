import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Falta firma o configuración de Webhook' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Error al verificar Webhook de Stripe:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const session = event.data.object as any;

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscriptionId = session.subscription || session.id;
        const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
        
        const userId = subscription.metadata?.userId || session.metadata?.userId;
        
        if (userId) {
          const status = subscription.status;
          
          // Lógica de Tier: 
          // En producción, comparamos el Price ID con nuestra lista de precios oficiales.
          // Por ahora, asumimos que cualquier suscripción activa otorga tier 'premium'.
          const tier = status === 'active' ? 'premium' : 'basico';

          // 1. Actualización rápida del perfil de usuario
          await supabaseAdmin
            .from('users')
            .update({
              subscription_status: status,
              subscription_id: subscription.id,
              subscription_tier: tier,
            })
            .eq('id', userId);

          // 2. Registro detallado en tabla suscripciones para historial/logs
          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              id: subscription.id,
              user_id: userId,
              status: status,
              price_id: subscription.items.data[0].price.id,
              quantity: subscription.items.data[0].quantity || 1,
              cancel_at_period_end: subscription.cancel_at_period_end,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            });
          
          console.log(`Sincronización exitosa: User ${userId} -> Status ${status}`);
        }
        break;

      default:
        // Ignoramos otros eventos
    }
  } catch (error) {
    console.error('Error al manejar evento de Stripe en DB:', error);
    return NextResponse.json({ error: 'Error al sincronizar base de datos' }, { status: 500 });
  }

  return NextResponse.json({ recibido: true });
}
