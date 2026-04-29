import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendPushToRestaurant } from "@/lib/push";
import { sendTipNotificationEmail } from "@/lib/email";
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

        if (!restaurantId) {
          throw new Error(`PaymentIntent ${paymentIntent.id} missing restaurant_id metadata`);
        }

        console.log(
          `[webhook] Payment succeeded: ${paymentIntent.id} | Restaurant: ${restaurantId} | Tip: ${tipCents}`
        );

        const { data: restaurantExists, error: restaurantError } = await supabaseAdmin
          .from("restaurant")
          .select("id")
          .eq("id", restaurantId)
          .is("deleted_at", null)
          .maybeSingle();

        if (restaurantError || !restaurantExists) {
          throw new Error(`Restaurant ${restaurantId} not found for PaymentIntent ${paymentIntent.id}`);
        }

        // Upsert (not insert) to make the webhook idempotent — Stripe can retry events
        const { error: tipError } = await supabaseAdmin.from("tip").upsert({
          restaurant_id: restaurantId,
          amount_cents: tipCents,
          platform_fee_cents: calculatePlatformFee(tipCents),
          stripe_payment_id: paymentIntent.id,
          status: "completed",
        }, { onConflict: "stripe_payment_id", ignoreDuplicates: true });

        if (tipError) {
          console.error("[webhook] Error upserting tip:", tipError);
          throw new Error(`Failed to persist tip for PaymentIntent ${paymentIntent.id}`);
        }

        if (restaurantId) {
          // Push notification
          sendPushToRestaurant(restaurantId, {
            title: "Nueva propina",
            body: `Has recibido una propina de ${formatCentsShort(tipCents)}`,
            url: "/dashboard",
            tag: `tip-${paymentIntent.id}`,
          }).catch((err) => console.error("[webhook] Push error:", err));

          // Email notification (if configured) — fire and forget
          void (async () => {
            try {
              const { data: rest } = await supabaseAdmin
                .from("restaurant")
                .select("name, email_notifications_enabled, notification_email, owner_id")
                .eq("id", restaurantId)
                .single();

              if (!rest?.email_notifications_enabled) return;

              // Calculate today's total for the email
              const todayStart = new Date();
              todayStart.setHours(0, 0, 0, 0);
              const { data: todayTips } = await supabaseAdmin
                .from("tip")
                .select("amount_cents, platform_fee_cents")
                .eq("restaurant_id", restaurantId)
                .eq("status", "completed")
                .gte("created_at", todayStart.toISOString());

              const totalTodayCents = (todayTips || []).reduce(
                (sum: number, t: { amount_cents: number; platform_fee_cents: number }) =>
                  sum + t.amount_cents - (t.platform_fee_cents || 0),
                0
              );

              // Get owner email if no override
              let toEmail: string | null = rest.notification_email;
              if (!toEmail && rest.owner_id) {
                const { data: ownerStaff } = await supabaseAdmin
                  .from("staff")
                  .select("auth_user_id, email")
                  .eq("id", rest.owner_id)
                  .maybeSingle();
                if (ownerStaff?.auth_user_id) {
                  const { data: ownerUser } = await supabaseAdmin.auth.admin.getUserById(ownerStaff.auth_user_id);
                  toEmail = ownerUser?.user?.email ?? ownerStaff.email ?? null;
                } else {
                  toEmail = ownerStaff?.email ?? null;
                }
              }

              if (toEmail) {
                await sendTipNotificationEmail({
                  to: toEmail,
                  restaurantName: rest.name,
                  amountCents: tipCents,
                  totalTodayCents,
                });
              }
            } catch (err) {
              console.error("[webhook] Email notification error:", err);
            }
          })();
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
        const isFullRefund = charge.amount_refunded >= charge.amount;
        console.log(`[webhook] Charge refunded: ${charge.id} | PI: ${paymentIntentId} | full=${isFullRefund} | refunded=${charge.amount_refunded}/${charge.amount}`);

        if (paymentIntentId) {
          const { data: refundedTip, error: refundUpdateError } = await supabaseAdmin
            .from("tip")
            .update({ status: isFullRefund ? "refunded" : "completed" })
            .eq("stripe_payment_id", paymentIntentId)
            .select("restaurant_id")
            .maybeSingle();

          if (refundUpdateError) throw refundUpdateError;

          const restaurantId = refundedTip?.restaurant_id || charge.metadata?.restaurant_id;
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
          const { error: updateError } = await supabaseAdmin
            .from("restaurant")
            .update({
              stripe_charges_enabled: account.charges_enabled,
              stripe_payouts_enabled: account.payouts_enabled,
            })
            .eq("id", restaurant.id);
          if (updateError) throw updateError;
        }

        // Update staff if this is a waiter's payout account
        const { data: staffMember } = await supabaseAdmin
          .from("staff")
          .select("id, restaurant_id")
          .eq("stripe_payout_id", account.id)
          .maybeSingle();

        if (staffMember) {
          const { error: updateError } = await supabaseAdmin
            .from("staff")
            .update({
              stripe_payouts_enabled: account.payouts_enabled,
            })
            .eq("id", staffMember.id);
          if (updateError) throw updateError;

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
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
