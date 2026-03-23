import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendPushToRestaurant } from "@/lib/push";
import { formatCentsShort } from "@/lib/utils";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: "Invalid signature." },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const restaurantId = paymentIntent.metadata?.restaurant_id;
        console.log(
          `[webhook] Payment succeeded: ${paymentIntent.id} | Restaurant: ${restaurantId} | Amount: ${paymentIntent.amount}`
        );
        await supabaseAdmin
          .from("tip")
          .update({ status: "completed" })
          .eq("stripe_payment_id", paymentIntent.id);

        // Send push notification to restaurant staff
        if (restaurantId) {
          const tipCents = Number(paymentIntent.metadata?.tip_amount_cents) || paymentIntent.amount;
          sendPushToRestaurant(restaurantId, {
            title: "Nueva propina",
            body: `Has recibido una propina de ${formatCentsShort(tipCents)}`,
            url: "/dashboard",
            tag: `tip-${paymentIntent.id}`,
          }).catch((err) => console.error("[webhook] Push error:", err));
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(
          `[webhook] Payment failed: ${paymentIntent.id} | Reason: ${paymentIntent.last_payment_error?.message}`
        );
        await supabaseAdmin
          .from("tip")
          .update({ status: "failed" })
          .eq("stripe_payment_id", paymentIntent.id);
        break;
      }

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("[webhook] Error processing event:", error);
    // Return 200 to prevent Stripe from retrying
  }

  return NextResponse.json({ received: true });
}
