import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { auth, error: authError } = await requireAuth();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("account_id");

    if (!accountId) {
      return NextResponse.json(
        { error: "account_id es obligatorio." },
        { status: 400 }
      );
    }

    // Verify the account belongs to the user's restaurant or staff
    const { data: restaurant } = await supabaseAdmin
      .from("restaurant")
      .select("id")
      .eq("id", auth.restaurantId)
      .eq("stripe_account_id", accountId)
      .maybeSingle();

    const { data: staffAccount } = await supabaseAdmin
      .from("staff")
      .select("id")
      .eq("restaurant_id", auth.restaurantId)
      .eq("stripe_payout_id", accountId)
      .maybeSingle();

    const canReadRestaurantAccount = Boolean(restaurant && auth.role === "owner");
    const canReadStaffAccount = Boolean(staffAccount && staffAccount.id === auth.staffId);

    if (!canReadRestaurantAccount && !canReadStaffAccount) {
      return NextResponse.json(
        { error: "No tienes acceso a esta cuenta." },
        { status: 403 }
      );
    }

    const account = await getStripe().accounts.retrieve(accountId);

    return NextResponse.json({
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: account.requirements?.currently_due || [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("[stripe/connect/status] Error:", message);
    return NextResponse.json(
      { error: "Error al consultar el estado de la cuenta." },
      { status: 500 }
    );
  }
}
