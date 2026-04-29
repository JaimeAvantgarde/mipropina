import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireOwner } from "@/lib/auth";
import { getRestaurantTipLedger } from "@/lib/balances";

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

    if (
      payouts.some(
        (p) =>
          typeof p.staff_id !== "string" ||
          !Number.isInteger(p.amount_cents) ||
          p.amount_cents <= 0
      )
    ) {
      return NextResponse.json(
        { error: "Los pagos deben tener camarero e importe válido." },
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

    const { auth, error: authError } = await requireOwner(restaurant_id);
    if (authError) return authError;

    const ledger = await getRestaurantTipLedger(restaurant_id);
    if (totalCents > ledger.availableCents) {
      return NextResponse.json(
        { error: "El reparto excede el saldo disponible." },
        { status: 400 }
      );
    }

    const staffIds = [...new Set(payouts.map((p) => p.staff_id))];
    const { data: staffRecords } = await supabaseAdmin
      .from("staff")
      .select("id")
      .in("id", staffIds)
      .eq("restaurant_id", restaurant_id)
      .eq("active", true);

    if (!staffRecords || staffRecords.length !== staffIds.length) {
      return NextResponse.json(
        { error: "Algunos camareros no pertenecen a este restaurante." },
        { status: 403 }
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
        created_by: auth.staffId,
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
