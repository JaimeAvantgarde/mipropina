import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/auth";

export async function GET() {
  const { error: authError } = await requireSuperadmin();
  if (authError) return authError;

  try {
    // Fetch all restaurants
    const { data: restaurants } = await supabaseAdmin
      .from("restaurant")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    // Fetch all staff
    const { data: allStaff } = await supabaseAdmin
      .from("staff")
      .select("id, restaurant_id, name, role, active");

    // Fetch all completed tips
    const { data: allTips } = await supabaseAdmin
      .from("tip")
      .select("restaurant_id, amount_cents, platform_fee_cents, status")
      .eq("status", "completed");

    // Fetch all distributed distributions
    const { data: allDistributions } = await supabaseAdmin
      .from("distribution")
      .select("restaurant_id, total_cents, status")
      .eq("status", "distributed");

    // Build per-restaurant metrics
    const restaurantMetrics = (restaurants || []).map((r) => {
      const tips = (allTips || []).filter((t) => t.restaurant_id === r.id);
      const staff = (allStaff || []).filter((s) => s.restaurant_id === r.id);
      const distributions = (allDistributions || []).filter((d) => d.restaurant_id === r.id);

      const totalTipsCents = tips.reduce((sum, t) => sum + t.amount_cents, 0);
      const totalFeesCents = tips.reduce((sum, t) => sum + (t.platform_fee_cents || 0), 0);
      const netCents = totalTipsCents - totalFeesCents;
      const distributedCents = distributions.reduce((sum, d) => sum + d.total_cents, 0);
      const availableCents = netCents - distributedCents;

      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        logo_emoji: r.logo_emoji,
        logo_url: r.logo_url,
        stripe_account_id: r.stripe_account_id,
        created_at: r.created_at,
        tips_count: tips.length,
        total_tips_cents: totalTipsCents,
        total_fees_cents: totalFeesCents,
        net_cents: netCents,
        distributed_cents: distributedCents,
        available_cents: availableCents,
        staff_count: staff.filter((s) => s.active).length,
        total_staff: staff.length,
      };
    });

    // Global stats
    const totalTipsCents = (allTips || []).reduce((sum, t) => sum + t.amount_cents, 0);
    const totalFeesCents = (allTips || []).reduce((sum, t) => sum + (t.platform_fee_cents || 0), 0);
    const totalClientFees = (allTips || []).length * 20; // CLIENT_FEE_CENTS = 20

    return NextResponse.json({
      globalStats: {
        total_tips_cents: totalTipsCents,
        total_platform_fees_cents: totalFeesCents,
        total_client_fees_cents: totalClientFees,
        total_revenue_cents: totalFeesCents + totalClientFees,
        restaurants_count: (restaurants || []).length,
        active_staff_count: (allStaff || []).filter((s) => s.active).length,
        total_tips_count: (allTips || []).length,
      },
      restaurants: restaurantMetrics,
    });
  } catch (error) {
    console.error("[admin/data] Error:", error);
    return NextResponse.json(
      { error: "Error al cargar datos de administración." },
      { status: 500 }
    );
  }
}
