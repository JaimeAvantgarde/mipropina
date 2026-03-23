import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendPushToRestaurant } from "@/lib/push";
import { formatCentsShort, calculatePlatformFee } from "@/lib/utils";
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
      /* ─── Payment succeeded ─── */
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const restaurantId = paymentIntent.metadata?.restaurant_id;
        const tipCents = Number(paymentIntent.metadata?.tip_amount_cents) || paymentIntent.amount;

        console.log(
          `[webhook] Payment succeeded: ${paymentIntent.id} | Restaurant: ${restaurantId} | Tip: ${tipCents}`
        );

        await supabaseAdmin.from("tip").insert({
          restaurant_id: restaurantId,
          amount_cents: tipCents,
          platform_fee_cents: calculatePlatformFee(tipCents),
          stripe_payment_id: paymentIntent.id,
          status: "completed",
        });

        if (restaurantId) {
          sendPushToRestaurant(restaurantId, {
            title: "Nueva propina",
            body: `Has recibido una propina de ${formatCentsShort(tipCents)}`,
            url: "/dashboard",
            tag: `tip-${paymentIntent.id}`,
          }).catch((err) => console.error("[webhook] Push error:", err));
        }
        break;
      }

      /* ─── Payment failed ─── */
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(
          `[webhook] Payment failed: ${paymentIntent.id} | Reason: ${paymentIntent.last_payment_error?.message}`
        );
        break;
      }

      /* ─── Refund ─── */
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;
        console.log(`[webhook] Charge refunded: ${charge.id} | PI: ${paymentIntentId}`);

        if (paymentIntentId) {
          await supabaseAdmin
            .from("tip")
            .update({ status: "refunded" })
            .eq("stripe_payment_id", paymentIntentId);

          const restaurantId = charge.metadata?.restaurant_id;
          if (restaurantId) {
            sendPushToRestaurant(restaurantId, {
              title: "Propina reembolsada",
              body: `Se ha reembolsado una propina de ${formatCentsShort(charge.amount_refunded)}`,
              url: "/dashboard",
              tag: `refund-${charge.id}`,
            }).catch((err) => console.error("[webhook] Push error:", err));
          }
        }
        break;
      }

      /* ─── Stripe Connect account updated ─── */
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        console.log(
          `[webhook] Account updated: ${account.id} | charges=${account.charges_enabled} payouts=${account.payouts_enabled}`
        );

        // Update restaurant if this is a restaurant's connect account
        const { data: restaurant } = await supabaseAdmin
          .from("restaurant")
          .select("id")
          .eq("stripe_account_id", account.id)
          .maybeSingle();

        if (restaurant) {
          await supabaseAdmin
            .from("restaurant")
            .update({
              stripe_charges_enabled: account.charges_enabled,
              stripe_payouts_enabled: account.payouts_enabled,
            })
            .eq("id", restaurant.id);
        }

        // Update staff if this is a waiter's payout account
        const { data: staffMember } = await supabaseAdmin
          .from("staff")
          .select("id, restaurant_id")
          .eq("stripe_payout_id", account.id)
          .maybeSingle();

        if (staffMember) {
          await supabaseAdmin
            .from("staff")
            .update({
              stripe_payouts_enabled: account.payouts_enabled,
            })
            .eq("id", staffMember.id);

          if (account.payouts_enabled && account.details_submitted) {
            sendPushToRestaurant(staffMember.restaurant_id, {
              title: "Stripe Connect activo",
              body: `La cuenta de Stripe de un miembro del equipo ya está verificada`,
              url: "/dashboard/equipo",
              tag: `connect-${account.id}`,
            }).catch((err) => console.error("[webhook] Push error:", err));
          }
        }
        break;
      }

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("[webhook] Error processing event:", error);
  }

  return NextResponse.json({ received: true });
}
