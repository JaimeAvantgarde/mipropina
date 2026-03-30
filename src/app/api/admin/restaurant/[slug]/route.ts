import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error: authError } = await requireSuperadmin();
  if (authError) return authError;

  const { slug } = await params;

  try {
    // Fetch restaurant
    const { data: restaurant } = await supabaseAdmin
      .from("restaurant")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurante no encontrado." },
        { status: 404 }
      );
    }

    // Fetch staff
    const { data: staff } = await supabaseAdmin
      .from("staff")
      .select("id, name, email, phone, role, avatar_emoji, active, stripe_payout_id, created_at")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: true });

    // Fetch tips (last 100)
    const { data: tips } = await supabaseAdmin
      .from("tip")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false })
      .limit(100);

    // Fetch distributions
    const { data: distributions } = await supabaseAdmin
      .from("distribution")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false });

    // Fetch payouts for distributions
    const distributionIds = (distributions || []).map((d) => d.id);
    const { data: payouts } = distributionIds.length > 0
      ? await supabaseAdmin
          .from("payout")
          .select("*")
          .in("distribution_id", distributionIds)
      : { data: [] };

    // Calculate stats
    const completedTips = (tips || []).filter((t) => t.status === "completed");
    const totalTipsCents = completedTips.reduce((sum, t) => sum + t.amount_cents, 0);
    const totalFeesCents = completedTips.reduce((sum, t) => sum + (t.platform_fee_cents || 0), 0);
    const netCents = totalTipsCents - totalFeesCents;
    const distributedCents = (distributions || [])
      .filter((d) => d.status === "distributed")
      .reduce((sum, d) => sum + d.total_cents, 0);
    const availableCents = netCents - distributedCents;

    return NextResponse.json({
      restaurant,
      staff: staff || [],
      tips: tips || [],
      distributions: (distributions || []).map((d) => ({
        ...d,
        payouts: (payouts || []).filter((p) => p.distribution_id === d.id),
      })),
      stats: {
        total_tips_cents: totalTipsCents,
        total_fees_cents: totalFeesCents,
        net_cents: netCents,
        distributed_cents: distributedCents,
        available_cents: availableCents,
        tips_count: completedTips.length,
      },
    });
  } catch (error) {
    console.error("[admin/restaurant] Error:", error);
    return NextResponse.json(
      { error: "Error al cargar datos del restaurante." },
      { status: 500 }
    );
  }
}
