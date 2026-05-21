import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateMonthlyCredits } from '@/lib/ai-credits';
import { AI_CREDIT_PACKS, AI_CREDIT_COSTS } from '@/lib/ai-constants';

/**
 * GET /api/ai/credits — Obtener saldo de créditos IA del usuario
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const credits = await getOrCreateMonthlyCredits(user.id);

    return NextResponse.json({
      ...credits,
      costs: AI_CREDIT_COSTS,
      packs: AI_CREDIT_PACKS,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

/**
 * POST /api/ai/credits — Iniciar compra de un pack de créditos IA
 * Body: { packId: string }
 * Retorna URL de Stripe Checkout para el pago puntual
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const { packId } = await req.json();
    const pack = AI_CREDIT_PACKS.find(p => p.id === packId);

    if (!pack) {
      return NextResponse.json({ error: 'Pack de créditos no válido' }, { status: 400 });
    }

    // Obtener datos del usuario y tenant para Stripe Connect
    const { data: profile } = await supabase
      .from('users')
      .select('tenant_id, stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    // Obtener stripe_account_id del tenant (para Direct Charges)
    let stripeAccountId: string | null = null;
    if (profile.tenant_id) {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('stripe_account_id, stripe_charges_enabled')
        .eq('id', profile.tenant_id)
        .single();

      if (tenant?.stripe_charges_enabled && tenant?.stripe_account_id) {
        stripeAccountId = tenant.stripe_account_id;
      }
    }

    // Crear sesión de Stripe Checkout para pago puntual
    const { stripe } = await import('@/lib/stripe');
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.inagrosolutions.com';

    const sessionParams: any = {
      mode: 'payment' as const,
      customer_email: profile.stripe_customer_id ? undefined : profile.email,
      customer: profile.stripe_customer_id || undefined,
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${pack.label} — ${pack.credits} Créditos IA`,
            description: `Pack de ${pack.credits} créditos para funciones de Inteligencia Artificial del Cuaderno Digital`,
          },
          unit_amount: Math.round(pack.price * 100), // en céntimos
        },
        quantity: 1,
      }],
      metadata: {
        type: 'ai_credits_pack',
        userId: user.id,
        packId: pack.id,
        credits: String(pack.credits),
        tenantId: profile.tenant_id || '',
      },
      success_url: `${origin}/cuaderno?ai_credits=success&credits=${pack.credits}`,
      cancel_url: `${origin}/cuaderno`,
    };

    // Si hay cuenta Connect, usar Direct Charges con application_fee
    if (stripeAccountId) {
      sessionParams.payment_intent_data = {
        application_fee_amount: Math.round(pack.price * 100 * 0.5), // 50% para InagroSolutions
      };
    }

    const session = await stripe.checkout.sessions.create(
      sessionParams,
      stripeAccountId ? { stripeAccount: stripeAccountId } : undefined
    );

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating AI credits checkout:', error);
    return NextResponse.json({ error: error.message || 'Error creando sesión de pago' }, { status: 500 });
  }
}
