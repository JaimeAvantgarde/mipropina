import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Require authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado.", no_restaurant: true },
        { status: 401 }
      );
    }

    // Get staff record for this user
    const { data: staffRecord } = await supabaseAdmin
      .from("staff")
      .select("id, restaurant_id, role")
      .eq("auth_user_id", user.id)
      .eq("active", true)
      .maybeSingle();

    if (!staffRecord) {
      return NextResponse.json(
        { error: "No se encontró un restaurante.", no_restaurant: true },
        { status: 404 }
      );
    }

    const restaurantId = staffRecord.restaurant_id;
    const currentUserRole = staffRecord.role || "waiter";
    const currentUserStaffId = staffRecord.id;

    // Fetch restaurant
    const { data: restaurant, error: restError } = await supabaseAdmin
      .from("restaurant")
      .select("*")
      .eq("id", restaurantId)
      .single();

    if (restError || !restaurant) {
      return NextResponse.json(
        { error: "Restaurante no encontrado." },
        { status: 404 }
      );
    }

    // Fetch active staff only
    const { data: rawStaff } = await supabaseAdmin
      .from("staff")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("active", true)
      .order("created_at", { ascending: true });

    // Strip sensitive fields (IBAN, phone, stripe IDs) for non-owners
    const staff = currentUserRole === "owner"
      ? rawStaff
      : (rawStaff || []).map(({ iban, phone, stripe_payout_id, ...safe }: any) => safe);

    // Fetch tips (last 50)
    const { data: tips } = await supabaseAdmin
      .from("tip")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(50);

    // Fetch pending invite codes
    const { data: pendingInvites } = await supabaseAdmin
      .from("invite_code")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    // Fetch completed distributions to subtract from available balance
    const { data: distributions } = await supabaseAdmin
      .from("distribution")
      .select("total_cents")
      .eq("restaurant_id", restaurantId)
      .eq("status", "distributed");

    // Calculate stats
    const allTips = tips || [];
    const completedTips = allTips.filter((t: { status: string }) => t.status === "completed");
    const totalCents = completedTips.reduce((sum: number, t: { amount_cents: number }) => sum + t.amount_cents, 0);
    const totalFeeCents = completedTips.reduce((sum: number, t: { platform_fee_cents?: number }) => sum + (t.platform_fee_cents || 0), 0);
    const totalDistributed = (distributions || []).reduce((sum: number, d: { total_cents: number }) => sum + d.total_cents, 0);
    const netCents = totalCents - totalFeeCents - totalDistributed;
    const netCentsAllTime = totalCents - totalFeeCents;
    const avgCents = completedTips.length > 0 ? Math.round(netCentsAllTime / completedTips.length) : 0;

    // Tips this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    const tipsThisWeek = allTips.filter(
      (t: { created_at: string }) => new Date(t.created_at) >= weekStart
    );
    const tipsThisWeekCompleted = tipsThisWeek.filter((t: { status: string }) => t.status === "completed");
    const tipsThisWeekCents = tipsThisWeekCompleted.reduce(
      (sum: number, t: { amount_cents: number; platform_fee_cents?: number }) =>
        sum + t.amount_cents - (t.platform_fee_cents || 0),
      0
    );

    return NextResponse.json({
      restaurant,
      staff: staff || [],
      tips: allTips,
      pendingInvites: pendingInvites || [],
      currentUserRole,
      currentUserStaffId,
      stats: {
        totalCents,
        netCents,
        totalDistributed,
        tipsThisWeek: tipsThisWeek.length,
        tipsThisWeekCents,
        activeStaff: (staff || []).length,
        avgCents,
      },
    });
  } catch (error) {
    console.error("[dashboard/data] Error:", error);
    return NextResponse.json(
      { error: "Error al cargar los datos del dashboard." },
      { status: 500 }
    );
  }
}
