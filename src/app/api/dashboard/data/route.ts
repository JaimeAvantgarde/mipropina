import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    // Try to get the authenticated user first
    let restaurantId: string | null = null;

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Get staff record for this user to find their restaurant
        const { data: staffRecord } = await supabaseAdmin
          .from("staff")
          .select("restaurant_id")
          .eq("auth_user_id", user.id)
          .single();

        if (staffRecord) {
          restaurantId = staffRecord.restaurant_id;
        }
      }
    } catch {
      // Auth not available, fall through to query param
    }

    // Fallback: use restaurant_id from query param (dev mode)
    if (!restaurantId) {
      const { searchParams } = new URL(request.url);
      restaurantId = searchParams.get("restaurant_id");
    }

    if (!restaurantId) {
      // Try to get the first restaurant as fallback for dev
      const { data: firstRestaurant } = await supabaseAdmin
        .from("restaurant")
        .select("id")
        .limit(1)
        .single();

      if (firstRestaurant) {
        restaurantId = firstRestaurant.id;
      }
    }

    if (!restaurantId) {
      return NextResponse.json(
        { error: "No se encontró un restaurante." },
        { status: 404 }
      );
    }

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

    // Fetch staff
    const { data: staff } = await supabaseAdmin
      .from("staff")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: true });

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

    // Calculate stats
    const allTips = tips || [];
    const completedTips = allTips.filter((t: { status: string }) => t.status === "completed");
    const totalCents = completedTips.reduce((sum: number, t: { amount_cents: number }) => sum + t.amount_cents, 0);
    const avgCents = completedTips.length > 0 ? Math.round(totalCents / completedTips.length) : 0;

    // Tips this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);
    const tipsThisWeek = allTips.filter(
      (t: { created_at: string }) => new Date(t.created_at) >= weekStart
    );

    const activeStaff = (staff || []).filter((s: { active: boolean }) => s.active);

    return NextResponse.json({
      restaurant,
      staff: staff || [],
      tips: allTips,
      pendingInvites: pendingInvites || [],
      stats: {
        totalCents,
        tipsThisWeek: tipsThisWeek.length,
        activeStaff: activeStaff.length,
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
