import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Use service role for webhook — no user session available
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

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_placeholder"
    );
  } catch (error: any) {
    console.error("[STRIPE_WEBHOOK] Signature verification failed:", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const supabase = getAdminSupabase();

  try {
    switch (event.type) {
      // ─── Checkout completado: usuario acaba de pagar ───
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (!userId) {
          console.warn("[STRIPE_WEBHOOK] No userId in checkout metadata");
          break;
        }

        // Obtener la suscripción para saber qué plan compró
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const priceId = subscription.items.data[0]?.price.id;

        // Buscar el plan en nuestra tabla por stripe_price_id
        const { data: plan } = await supabase
          .from("plans")
          .select("id, slug")
          .eq("stripe_price_id", priceId)
          .single();

        // Actualizar el usuario en public.users
        await supabase.from("users").update({
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          subscription_status: "active",
          subscription_tier: plan?.slug || "basico",
          plan_id: plan?.id || null,
        }).eq("id", userId);

        console.log(`[STRIPE_WEBHOOK] ✅ User ${userId} activated plan ${plan?.slug || 'unknown'}`);
        break;
      }

      // ─── Renovación mensual exitosa ───
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) break;

        // Encontrar al usuario por su subscription_id
        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (user) {
          await supabase.from("users").update({
            subscription_status: "active",
          }).eq("id", user.id);
          console.log(`[STRIPE_WEBHOOK] ✅ Renewal succeeded for user ${user.id}`);
        }
        break;
      }

      // ─── Pago fallido ───
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) break;

        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (user) {
          await supabase.from("users").update({
            subscription_status: "past_due",
          }).eq("id", user.id);
          console.warn(`[STRIPE_WEBHOOK] ⚠️ Payment failed for user ${user.id}`);
        }
        break;
      }

      // ─── Suscripción cancelada o expirada ───
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
          }).eq("id", user.id);
          console.log(`[STRIPE_WEBHOOK] 🚫 Subscription cancelled for user ${user.id}`);
        }
        break;
      }

      // ─── Suscripción actualizada (upgrade/downgrade) ───
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const priceId = subscription.items.data[0]?.price.id;

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
          }).eq("id", user.id);
          console.log(`[STRIPE_WEBHOOK] 🔄 Subscription updated for user ${user.id} → ${plan?.slug}`);
        }
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
