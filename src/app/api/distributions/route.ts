import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurant_id");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurant_id es obligatorio." },
        { status: 400 }
      );
    }

    // Fetch distributions ordered by most recent
    const { data: distributions, error: distError } = await supabaseAdmin
      .from("distribution")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (distError) {
      console.error("[distributions] Error:", distError);
      return NextResponse.json(
        { error: "Error al cargar los repartos." },
        { status: 500 }
      );
    }

    // Fetch payouts for these distributions
    const distIds = (distributions || []).map((d: { id: string }) => d.id);
    let payouts: unknown[] = [];

    if (distIds.length > 0) {
      const { data: payoutData } = await supabaseAdmin
        .from("payout")
        .select("*")
        .in("distribution_id", distIds)
        .order("amount_cents", { ascending: false });

      payouts = payoutData || [];
    }

    return NextResponse.json({
      distributions: distributions || [],
      payouts,
    });
  } catch (error) {
    console.error("[distributions] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
