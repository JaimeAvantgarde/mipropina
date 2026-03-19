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

    // Note: payout records are now created by /api/stripe/create-payout
    // which also handles real Stripe transfers.
    // This route only creates the distribution record for non-Stripe manual flows.

    return NextResponse.json({
      distribution,
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
