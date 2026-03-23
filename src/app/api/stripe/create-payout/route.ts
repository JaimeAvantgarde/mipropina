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

    // Check available balance before attempting transfers
    const balance = await getStripe().balance.retrieve();
    const availableCents = balance.available
      .filter((b) => b.currency === "eur")
      .reduce((sum, b) => sum + b.amount, 0);

    const totalCentsRequested = payouts.reduce((sum: number, p: any) => sum + p.amount_cents, 0);
    if (availableCents < totalCentsRequested) {
      return NextResponse.json(
        {
          error: `Balance insuficiente. Disponible: ${(availableCents / 100).toFixed(2)}€. El dinero de las propinas tarda ~2 días laborables en estar disponible para repartir.`,
          available_cents: availableCents,
        },
        { status: 400 }
      );
    }

    // Fetch staff records to get stripe_payout_id
    const staffIds = payouts.map((p: any) => p.staff_id);
    const { data: staffRecords } = await supabaseAdmin
      .from("staff")
      .select("id, stripe_payout_id, name")
      .in("id", staffIds);

    if (!staffRecords) {
      return NextResponse.json({ error: "No se encontraron los camareros." }, { status: 404 });
    }

    // Create distribution record
    const totalCents = payouts.reduce((sum: number, p: any) => sum + p.amount_cents, 0);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

    const { data: distribution, error: distError } = await supabaseAdmin
      .from("distribution")
      .insert({
        restaurant_id,
        week_start: weekStart.toISOString().split("T")[0],
        week_end: now.toISOString().split("T")[0],
        total_cents: totalCents,
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
        // Create Stripe Transfer
        const transfer = await getStripe().transfers.create({
          amount: payout.amount_cents,
          currency: "eur",
          destination: staff.stripe_payout_id,
          metadata: {
            distribution_id: distribution.id,
            staff_id: payout.staff_id,
            restaurant_id,
          },
        });

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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
