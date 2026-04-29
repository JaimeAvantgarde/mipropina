import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { staff_id } = body;

    if (!staff_id) {
      return NextResponse.json(
        { error: "staff_id es obligatorio." },
        { status: 400 }
      );
    }

    const { auth, error: authError } = await requireAuth();
    if (authError) return authError;

    // Fetch staff record
    const { data: staff, error: staffError } = await supabaseAdmin
      .from("staff")
      .select("id, name, email, restaurant_id, stripe_payout_id")
      .eq("id", staff_id)
      .single();

    if (staffError || !staff) {
      return NextResponse.json(
        { error: "Empleado no encontrado." },
        { status: 404 }
      );
    }

    if (staff.restaurant_id !== auth.restaurantId) {
      return NextResponse.json({ error: "No tienes acceso a este perfil." }, { status: 403 });
    }

    // Only the staff member themselves can create/access their Stripe onboarding link.
    // The link can expose personal onboarding data once the account exists.
    const isSelf = auth.staffId === staff_id;
    if (!isSelf) {
      return NextResponse.json({ error: "Solo puedes crear tu propia cuenta de Stripe." }, { status: 403 });
    }

    let accountId = staff.stripe_payout_id;

    // Create Stripe Connect Express account
    if (!accountId) {
      const account = await getStripe().accounts.create({
        type: "express",
        country: "ES",
        email: staff.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          staff_id,
          restaurant_id: staff.restaurant_id,
        },
      });

      accountId = account.id;

      // Save Stripe account ID to staff record
      await supabaseAdmin
        .from("staff")
        .update({ stripe_payout_id: accountId })
        .eq("id", staff_id);
    }

    // Create onboarding link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mipropina.es";
    const accountLink = await getStripe().accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/dashboard/perfil?stripe=refresh`,
      return_url: `${appUrl}/dashboard/perfil?stripe=success`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      url: accountLink.url,
      account_id: accountId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("[stripe/connect/create-waiter-account] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
