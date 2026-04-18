import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Service role — no user session available in webhooks
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: any;

  // Verificar firma con secret principal o Connect
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_placeholder";

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    const connectSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
    if (connectSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, connectSecret);
      } catch {
        console.error("[STRIPE_WEBHOOK] Signature verification failed:", error.message);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
      }
    } else {
      console.error("[STRIPE_WEBHOOK] Signature verification failed:", error.message);
      return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }
  }

  const supabase = getAdminSupabase();

  try {
    switch (event.type) {

      // ─────────────────────────────────────────────────────
      // CHECKOUT COMPLETADO: usuario acaba de pagar
      // ─────────────────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const tenantId = session.metadata?.tenantId;

        if (!userId) {
          console.warn("[STRIPE_WEBHOOK] No userId in checkout metadata");
          break;
        }

        // Obtener detalle de la suscripción
        const stripeAccountId = event.account; // ID de cuenta Connect (Direct Charges)
        const subscriptionId = session.subscription;

        let subscription: any = null;
        if (subscriptionId) {
          subscription = stripeAccountId
            ? await stripe.subscriptions.retrieve(subscriptionId, undefined, { stripeAccount: stripeAccountId })
            : await stripe.subscriptions.retrieve(subscriptionId);
        }

        const priceId = subscription?.items?.data?.[0]?.price?.id;
        const interval = subscription?.items?.data?.[0]?.price?.recurring?.interval;

        // Buscar plan en nuestra tabla
        let planSlug = session.metadata?.plan || 'basico';
        const { data: plan } = await supabase
          .from("plans")
          .select("id, slug")
          .eq("stripe_price_id", priceId)
          .single();

        if (plan) planSlug = plan.slug;

        // Actualizar usuario
        await supabase.from("users").update({
          stripe_customer_id: session.customer,
          stripe_subscription_id: subscriptionId,
          subscription_status: "active",
          subscription_tier: planSlug,
          plan_id: plan?.id || null,
          billing_interval: interval === 'year' ? 'annual' : 'monthly',
          subscription_current_period_end: subscription?.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
          subscription_cancel_at_period_end: false,
        }).eq("id", userId);

        // También actualizar tabla subscriptions (legacy)
        if (subscription) {
          await supabase.from("subscriptions").upsert({
            id: subscriptionId,
            user_id: userId,
            status: "active",
            price_id: priceId,
            quantity: 1,
            cancel_at_period_end: false,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });
        }

        // Registrar transacción con reparto 50/50
        const amountTotal = session.amount_total || 0;
        const applicationFee = Math.round(amountTotal * 0.5);

        await supabase.from("payment_transactions").insert({
          user_id: userId,
          tenant_id: tenantId || null,
          stripe_payment_intent_id: session.payment_intent,
          stripe_invoice_id: session.invoice,
          amount_total: amountTotal,
          amount_platform: applicationFee,
          amount_tenant: amountTotal - applicationFee,
          currency: session.currency || 'eur',
          status: 'succeeded',
          billing_interval: interval === 'year' ? 'annual' : 'monthly',
          description: `Suscripción ${planSlug} - ${interval === 'year' ? 'Anual' : 'Mensual'}`,
          metadata: { checkout_session_id: session.id, stripe_account: stripeAccountId || null },
        });

        console.log(`[STRIPE_WEBHOOK] ✅ User ${userId} activated plan ${planSlug}`);
        break;
      }

      // ─────────────────────────────────────────────────────
      // RENOVACIÓN EXITOSA
      // ─────────────────────────────────────────────────────
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) break;

        // No re-procesar la primera factura (ya gestionada en checkout.session.completed)
        if (invoice.billing_reason === 'subscription_create') break;

        const { data: user } = await supabase
          .from("users")
          .select("id, tenant_id")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (user) {
          await supabase.from("users").update({
            subscription_status: "active",
            subscription_current_period_end: invoice.lines?.data?.[0]?.period?.end
              ? new Date(invoice.lines.data[0].period.end * 1000).toISOString()
              : null,
          }).eq("id", user.id);

          // Registrar transacción
          const amountTotal = invoice.amount_paid || 0;
          const applicationFee = Math.round(amountTotal * 0.5);

          await supabase.from("payment_transactions").insert({
            user_id: user.id,
            tenant_id: user.tenant_id || null,
            stripe_invoice_id: invoice.id,
            stripe_payment_intent_id: invoice.payment_intent,
            amount_total: amountTotal,
            amount_platform: applicationFee,
            amount_tenant: amountTotal - applicationFee,
            currency: invoice.currency || 'eur',
            status: 'succeeded',
            description: 'Renovación suscripción',
            metadata: { billing_reason: invoice.billing_reason },
          });

          console.log(`[STRIPE_WEBHOOK] ✅ Renewal succeeded for user ${user.id}`);
        }
        break;
      }

      // ─────────────────────────────────────────────────────
      // PAGO FALLIDO
      // ─────────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) break;

        const { data: user } = await supabase
          .from("users")
          .select("id, tenant_id")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (user) {
          await supabase.from("users").update({
            subscription_status: "past_due",
          }).eq("id", user.id);

          await supabase.from("payment_transactions").insert({
            user_id: user.id,
            tenant_id: user.tenant_id || null,
            stripe_invoice_id: invoice.id,
            amount_total: invoice.amount_due || 0,
            amount_platform: 0,
            amount_tenant: 0,
            currency: invoice.currency || 'eur',
            status: 'failed',
            description: `Pago fallido - intento ${invoice.attempt_count || 1}`,
          });

          console.warn(`[STRIPE_WEBHOOK] ⚠️ Payment failed for user ${user.id}`);
        }
        break;
      }

      // ─────────────────────────────────────────────────────
      // SUSCRIPCIÓN CANCELADA
      // ─────────────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (user) {
          await supabase.from("users").update({
            subscription_status: "cancelled",
            stripe_subscription_id: null,
            subscription_cancel_at_period_end: false,
          }).eq("id", user.id);
          console.log(`[STRIPE_WEBHOOK] 🚫 Subscription cancelled for user ${user.id}`);
        }
        break;
      }

      // ─────────────────────────────────────────────────────
      // SUSCRIPCIÓN ACTUALIZADA (upgrade/downgrade)
      // ─────────────────────────────────────────────────────
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const priceId = subscription.items.data[0]?.price.id;
        const interval = subscription.items.data[0]?.price?.recurring?.interval;

        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (user && priceId) {
          const { data: plan } = await supabase
            .from("plans")
            .select("id, slug")
            .eq("stripe_price_id", priceId)
            .single();

          await supabase.from("users").update({
            subscription_status: subscription.status === "active" ? "active" : subscription.status,
            subscription_tier: plan?.slug || undefined,
            plan_id: plan?.id || undefined,
            billing_interval: interval === 'year' ? 'annual' : 'monthly',
            subscription_current_period_end: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            subscription_cancel_at_period_end: subscription.cancel_at_period_end || false,
          }).eq("id", user.id);

          console.log(`[STRIPE_WEBHOOK] 🔄 Subscription updated for user ${user.id} → ${plan?.slug}`);
        }
        break;
      }

      // ─────────────────────────────────────────────────────
      // CUENTA CONNECT ACTUALIZADA (KYC cooperativa)
      // ─────────────────────────────────────────────────────
      case "account.updated": {
        const account = event.data.object;
        const tenantId = account.metadata?.tenant_id;

        if (!tenantId) {
          console.warn("[STRIPE_WEBHOOK] account.updated sin tenant_id en metadata");
          break;
        }

        const newStatus = account.charges_enabled && account.payouts_enabled
          ? 'completed'
          : account.details_submitted
            ? 'restricted'
            : 'pending';

        const updateData: Record<string, any> = {
          stripe_onboarding_status: newStatus,
          stripe_charges_enabled: account.charges_enabled || false,
          stripe_payouts_enabled: account.payouts_enabled || false,
        };

        if (newStatus === 'completed') {
          updateData.stripe_onboarding_completed_at = new Date().toISOString();
        }

        await supabase.from("tenants").update(updateData).eq("id", tenantId);

        console.log(`[STRIPE_WEBHOOK] 🏢 Account ${account.id} → ${newStatus} (tenant: ${tenantId})`);
        break;
      }

      default:
        console.log(`[STRIPE_WEBHOOK] Unhandled event: ${event.type}`);
    }
  } catch (err: any) {
    console.error("[STRIPE_WEBHOOK] Processing error:", err);
  }

  return new NextResponse(null, { status: 200 });
}
