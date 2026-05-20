import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const { data: restaurants } = await supabaseAdmin
      .from("restaurant")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    const { data: allStaff } = await supabaseAdmin
      .from("staff")
      .select("id, restaurant_id, name, role, status");

    const { data: allTips } = await supabaseAdmin
      .from("tip")
      .select("restaurant_id, amount_cents, platform_fee_cents, status")
      .eq("status", "completed");

    const { data: allDistributions } = await supabaseAdmin
      .from("distribution")
      .select("restaurant_id, total_cents, status")
      .eq("status", "distributed");

    const restaurantMetrics = (restaurants || []).map((r) => {
      const tips = (allTips || []).filter((t) => t.restaurant_id === r.id);
      const staff = (allStaff || []).filter((s) => s.restaurant_id === r.id);
      const distributions = (allDistributions || []).filter(
        (d) => d.restaurant_id === r.id
      );

      const totalTipsCents = tips.reduce((sum, t) => sum + t.amount_cents, 0);
      const totalFeesCents = tips.reduce(
        (sum, t) => sum + (t.platform_fee_cents || 0),
        0
      );
      const netCents = totalTipsCents - totalFeesCents;
      const distributedCents = distributions.reduce(
        (sum, d) => sum + d.total_cents,
        0
      );
      const availableCents = netCents - distributedCents;

      const manager = staff.find(
        (s) => s.id === r.manager_id && s.status === "active"
      );

      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        logo_emoji: r.logo_emoji,
        logo_url: r.logo_url,
        stripe_account_id: r.stripe_account_id,
        manager_id: r.manager_id,
        manager_name: manager?.name ?? null,
        created_at: r.created_at,
        tips_count: tips.length,
        total_tips_cents: totalTipsCents,
        total_fees_cents: totalFeesCents,
        net_cents: netCents,
        distributed_cents: distributedCents,
        available_cents: availableCents,
        staff_count: staff.filter((s) => s.status === "active").length,
        total_staff: staff.length,
      };
    });

    const totalTipsCents = (allTips || []).reduce(
      (sum, t) => sum + t.amount_cents,
      0
    );
    const totalFeesCents = (allTips || []).reduce(
      (sum, t) => sum + (t.platform_fee_cents || 0),
      0
    );
    const totalClientFees = (allTips || []).length * 20;

    return NextResponse.json({
      globalStats: {
        total_tips_cents: totalTipsCents,
        total_platform_fees_cents: totalFeesCents,
        total_client_fees_cents: totalClientFees,
        total_revenue_cents: totalFeesCents + totalClientFees,
        restaurants_count: (restaurants || []).length,
        active_staff_count: (allStaff || []).filter((s) => s.status === "active")
          .length,
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
