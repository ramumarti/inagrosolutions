import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

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
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;
  const supabase = await createClient();

  // Scenario 1: Subscription Created or Updated
  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const userId = session.metadata.userId;

    if (!userId) return new NextResponse("No user ID in metadata", { status: 400 });

    // Update User Plan in Supabase
    // We assume the user has a `plan` column in their metadata or a separate table
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        plan_status: "active",
        plan_tier: "premium" // Determine tier based on priceId ideally
      }
    });

    console.log(`[STRIPE_WEBHOOK] Success: User ${userId} upgraded to Premium`);
  }

  // Scenario 2: Active Monthly Renewal or Status Check
  if (event.type === "invoice.payment_succeeded") {
    // Payment confirmed for renewal
    console.log("[STRIPE_WEBHOOK] Renewal Succeeded");
  }

  // Scenario 3: Payment Failed / Subscription Cancelled
  if (event.type === "customer.subscription.deleted" || event.type === "invoice.payment_failed") {
    const userId = session.metadata?.userId;
    if (userId) {
       await supabase.auth.admin.updateUserById(userId, {
         user_metadata: { plan_status: "expired" }
       });
    }
  }

  return new NextResponse(null, { status: 200 });
}
