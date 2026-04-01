import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { priceId, successUrl, cancelUrl } = await req.json();

    if (!priceId) {
      return new NextResponse("Price ID is required", { status: 400 });
    }

    // Creating Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId, // Must exist in Stripe Dashboard or be a test ID
          quantity: 1,
        },
      ],
      success_url: successUrl + "?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("[STRIPE_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
