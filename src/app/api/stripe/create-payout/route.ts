import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireOwner } from "@/lib/auth";
import { sendPushToRestaurant } from "@/lib/push";
import { formatCentsShort } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurant_id, method, payouts } = body;
    // payouts: [{ staff_id, amount_cents }]

    if (!restaurant_id || !payouts?.length) {
      return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
    }

    const { auth, error: authError } = await requireOwner(restaurant_id);
    if (authError) return authError;

    // Calculate restaurant's available balance from tips minus already distributed
    const { data: completedTips } = await supabaseAdmin
      .from("tip")
      .select("amount_cents, platform_fee_cents")
      .eq("restaurant_id", restaurant_id)
      .eq("status", "completed");

    const { data: existingDistributions } = await supabaseAdmin
      .from("distribution")
      .select("total_cents")
      .eq("restaurant_id", restaurant_id)
      .eq("status", "distributed");

    const totalTipNet = (completedTips || []).reduce(
      (sum: number, t: any) => sum + t.amount_cents - (t.platform_fee_cents || 0), 0
    );
    const totalDistributed = (existingDistributions || []).reduce(
      (sum: number, d: any) => sum + d.total_cents, 0
    );
    const restaurantAvailable = totalTipNet - totalDistributed;

    const totalCentsRequested = payouts.reduce((sum: number, p: any) => sum + p.amount_cents, 0);

    if (totalCentsRequested > restaurantAvailable) {
      return NextResponse.json(
        {
          error: `Excede el saldo del restaurante. Disponible para repartir: ${(restaurantAvailable / 100).toFixed(2)}€.`,
          available_cents: restaurantAvailable,
        },
        { status: 400 }
      );
    }

    // Also check Stripe platform balance
    const balance = await getStripe().balance.retrieve();
    const stripAvailableCents = balance.available
      .filter((b) => b.currency === "eur")
      .reduce((sum, b) => sum + b.amount, 0);

    if (stripAvailableCents < totalCentsRequested) {
      return NextResponse.json(
        {
          error: `Balance insuficiente en Stripe. Disponible: ${(stripAvailableCents / 100).toFixed(2)}€. El dinero de las propinas tarda ~2 días laborables en estar disponible para repartir.`,
          available_cents: stripAvailableCents,
        },
        { status: 400 }
      );
    }

    // Fetch staff records — validate ALL belong to this restaurant (prevents cross-restaurant IDOR)
    const staffIds = [...new Set<string>(payouts.map((p: any) => p.staff_id))];
    const { data: staffRecords } = await supabaseAdmin
      .from("staff")
      .select("id, stripe_payout_id, name")
      .in("id", staffIds)
      .eq("restaurant_id", restaurant_id);

    if (!staffRecords || staffRecords.length !== staffIds.length) {
      return NextResponse.json({ error: "Algunos camareros no pertenecen a este restaurante." }, { status: 403 });
    }

    // Create distribution record
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

    const { data: distribution, error: distError } = await supabaseAdmin
      .from("distribution")
      .insert({
        restaurant_id,
        week_start: weekStart.toISOString().split("T")[0],
        week_end: now.toISOString().split("T")[0],
        total_cents: totalCentsRequested,
        method: method || "custom",
        status: "pending",
      })
      .select()
      .single();

    if (distError || !distribution) {
      return NextResponse.json({ error: "Error al crear la distribución." }, { status: 500 });
    }

    const results = [];

    for (const payout of payouts) {
      const staff = staffRecords.find((s: any) => s.id === payout.staff_id);
      if (!staff?.stripe_payout_id) {
        results.push({ staff_id: payout.staff_id, status: "skipped", reason: "No Stripe account" });
        continue;
      }

      try {
        // Create Stripe Transfer — idempotency key prevents duplicate transfers on retry
        const idempotencyKey = `payout-${distribution.id}-${payout.staff_id}`;
        const transfer = await getStripe().transfers.create(
          {
            amount: payout.amount_cents,
            currency: "eur",
            destination: staff.stripe_payout_id,
            metadata: {
              distribution_id: distribution.id,
              staff_id: payout.staff_id,
              restaurant_id,
            },
          },
          { idempotencyKey }
        );

        // Create payout record
        await supabaseAdmin.from("payout").insert({
          distribution_id: distribution.id,
          staff_id: payout.staff_id,
          amount_cents: payout.amount_cents,
          stripe_transfer_id: transfer.id,
          status: "sent",
          paid_at: new Date().toISOString(),
        });

        results.push({ staff_id: payout.staff_id, status: "sent", transfer_id: transfer.id });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error";

        // Record failed payout
        await supabaseAdmin.from("payout").insert({
          distribution_id: distribution.id,
          staff_id: payout.staff_id,
          amount_cents: payout.amount_cents,
          status: "failed",
        });

        results.push({ staff_id: payout.staff_id, status: "failed", error: message });

        // Notify owner about failed transfer
        sendPushToRestaurant(restaurant_id, {
          title: "Transferencia fallida",
          body: `La transferencia a ${staff?.name || "un camarero"} de ${formatCentsShort(payout.amount_cents)} ha fallado`,
          url: "/dashboard/repartos",
          tag: `transfer-fail-${payout.staff_id}`,
        }).catch(() => {});
      }
    }

    // Update distribution status
    const allSent = results.every((r) => r.status === "sent");
    await supabaseAdmin
      .from("distribution")
      .update({ status: allSent ? "distributed" : "pending" })
      .eq("id", distribution.id);

    return NextResponse.json({
      distribution_id: distribution.id,
      results,
      message: `${results.filter((r) => r.status === "sent").length} transferencias completadas.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("[create-payout] Error:", message);
    return NextResponse.json({ error: "Error al procesar el reparto." }, { status: 500 });
  }
}
