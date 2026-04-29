import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import { getRestaurantTipLedger } from "@/lib/balances";

type StaffRow = {
  id: string;
  restaurant_id: string;
  auth_user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  avatar_emoji: string;
  role: "owner" | "waiter";
  iban: string | null;
  stripe_payout_id: string | null;
  stripe_payouts_enabled: boolean;
  active: boolean;
  created_at: string;
};

type TipRow = {
  id: string;
  restaurant_id: string;
  amount_cents: number;
  platform_fee_cents?: number | null;
  stripe_payment_id?: string | null;
  status: string;
  customer_session?: string | null;
  created_at: string;
};

export async function GET() {
  try {
    const { auth, error: authError } = await requireAuth();
    if (authError) return authError;

    const restaurantId = auth.restaurantId;
    const currentUserRole = auth.role;
    const currentUserStaffId = auth.staffId;
    const isOwner = currentUserRole === "owner";

    const { data: restaurant, error: restError } = await supabaseAdmin
      .from("restaurant")
      .select("*")
      .eq("id", restaurantId)
      .is("deleted_at", null)
      .single();

    if (restError || !restaurant) {
      return NextResponse.json(
        { error: "Restaurante no encontrado.", no_restaurant: true },
        { status: 404 }
      );
    }

    const { data: rawStaff } = await supabaseAdmin
      .from("staff")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("active", true)
      .order("created_at", { ascending: true });

    const staff = isOwner
      ? rawStaff || []
      : ((rawStaff || []) as StaffRow[]).map((member) => ({
          id: member.id,
          restaurant_id: member.restaurant_id,
          auth_user_id: member.auth_user_id,
          name: member.name,
          email: member.email,
          avatar_emoji: member.avatar_emoji,
          role: member.role,
          stripe_payouts_enabled: member.stripe_payouts_enabled,
          active: member.active,
          created_at: member.created_at,
          phone: member.id === currentUserStaffId ? member.phone : null,
          iban: member.id === currentUserStaffId ? member.iban : null,
          stripe_payout_id:
            member.id === currentUserStaffId ? member.stripe_payout_id : null,
        }));

    const { data: tips } = await supabaseAdmin
      .from("tip")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(50);

    const pendingInvites = isOwner
      ? (
          await supabaseAdmin
            .from("invite_code")
            .select("id, restaurant_id, phone, name, used, expires_at, created_at")
            .eq("restaurant_id", restaurantId)
            .eq("used", false)
            .gt("expires_at", new Date().toISOString())
            .order("created_at", { ascending: false })
        ).data || []
      : [];

    const ledger = await getRestaurantTipLedger(restaurantId);
    const allTips = (tips || []) as TipRow[];
    const completedRecentTips = allTips.filter((tip) => tip.status === "completed");

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const { data: weekTips } = await supabaseAdmin
      .from("tip")
      .select("amount_cents, platform_fee_cents, status, created_at")
      .eq("restaurant_id", restaurantId)
      .eq("status", "completed")
      .gte("created_at", weekStart.toISOString());

    const tipsThisWeekCents = (weekTips || []).reduce(
      (
        sum: number,
        tip: { amount_cents: number; platform_fee_cents?: number | null }
      ) => sum + tip.amount_cents - (tip.platform_fee_cents || 0),
      0
    );

    const avgCents =
      ledger.grossTipCents > 0 && completedRecentTips.length > 0
        ? Math.round(
            completedRecentTips.reduce(
              (sum, tip) =>
                sum + tip.amount_cents - (tip.platform_fee_cents || 0),
              0
            ) / completedRecentTips.length
          )
        : 0;

    return NextResponse.json({
      restaurant: isOwner
        ? restaurant
        : {
            ...restaurant,
            notification_email: null,
            stripe_account_id: null,
          },
      staff,
      tips: allTips,
      pendingInvites,
      currentUserRole,
      currentUserStaffId,
      stats: {
        totalCents: ledger.grossTipCents,
        netCents: ledger.availableCents,
        totalDistributed: ledger.allocatedCents,
        tipsThisWeek: weekTips?.length || 0,
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
