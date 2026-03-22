import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurant_id } = body;

    if (!restaurant_id) {
      return NextResponse.json(
        { error: "restaurant_id es obligatorio." },
        { status: 400 }
      );
    }

    // Check if restaurant already has a Stripe account
    const { data: restaurant } = await supabaseAdmin
      .from("restaurant")
      .select("id, name, stripe_account_id")
      .eq("id", restaurant_id)
      .single();

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurante no encontrado." },
        { status: 404 }
      );
    }

    let accountId = restaurant.stripe_account_id;

    // Create Stripe Connect account (recipient — only receives transfers, no card payments)
    if (!accountId) {
      const account = await getStripe().accounts.create({
        type: "custom",
        country: "ES",
        capabilities: {
          transfers: { requested: true },
        },
        tos_acceptance: {
          service_agreement: "recipient",
        },
        business_type: "individual",
        metadata: {
          restaurant_id,
          restaurant_name: restaurant.name,
        },
      });

      accountId = account.id;

      // Save to DB
      await supabaseAdmin
        .from("restaurant")
        .update({ stripe_account_id: accountId })
        .eq("id", restaurant_id);
    }

    // Create onboarding link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mipropina.es";
    const accountLink = await getStripe().accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/dashboard/ajustes?stripe=refresh`,
      return_url: `${appUrl}/dashboard/ajustes?stripe=success`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      url: accountLink.url,
      account_id: accountId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("[stripe/connect/create-account] Error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
