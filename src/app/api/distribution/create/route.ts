import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type PayoutEntry = {
  staff_id: string;
  amount_cents: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurant_id, method, payouts } = body as {
      restaurant_id: string;
      method: "equal" | "custom";
      payouts: PayoutEntry[];
    };

    if (!restaurant_id || typeof restaurant_id !== "string") {
      return NextResponse.json(
        { error: "restaurant_id es obligatorio." },
        { status: 400 }
      );
    }

    if (!Array.isArray(payouts) || payouts.length === 0) {
      return NextResponse.json(
        { error: "Se necesita al menos un pago." },
        { status: 400 }
      );
    }

    const totalCents = payouts.reduce((sum, p) => sum + p.amount_cents, 0);

    if (totalCents <= 0) {
      return NextResponse.json(
        { error: "El total a repartir debe ser mayor que 0." },
        { status: 400 }
      );
    }

    // Create distribution record
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const { data: distribution, error: distError } = await supabaseAdmin
      .from("distribution")
      .insert({
        restaurant_id,
        week_start: weekStart.toISOString().split("T")[0],
        week_end: now.toISOString().split("T")[0],
        total_cents: totalCents,
        method: method || "equal",
        status: "distributed",
        created_by: restaurant_id, // TODO: use actual staff id
      })
      .select()
      .single();

    if (distError) {
      console.error("[distribution/create] Distribution insert error:", distError);
      return NextResponse.json(
        { error: "Error al crear el reparto." },
        { status: 500 }
      );
    }

    // Create payout records
    const payoutRecords = payouts.map((p) => ({
      distribution_id: distribution.id,
      staff_id: p.staff_id,
      amount_cents: p.amount_cents,
      status: "pending" as const,
    }));

    const { error: payoutError } = await supabaseAdmin
      .from("payout")
      .insert(payoutRecords);

    if (payoutError) {
      console.error("[distribution/create] Payout insert error:", payoutError);
      // Rollback distribution
      await supabaseAdmin.from("distribution").delete().eq("id", distribution.id);
      return NextResponse.json(
        { error: "Error al crear los pagos individuales." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      distribution,
      payouts: payoutRecords,
      message: "Reparto creado correctamente.",
    });
  } catch (error) {
    console.error("[distribution/create] Error:", error);
    return NextResponse.json(
      { error: "Error al procesar el reparto." },
      { status: 500 }
    );
  }
}
