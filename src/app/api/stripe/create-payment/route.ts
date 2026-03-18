import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurant_id, amount_cents } = body;

    if (!restaurant_id || typeof restaurant_id !== "string") {
      return NextResponse.json(
        { error: "restaurant_id es obligatorio." },
        { status: 400 }
      );
    }

    if (!amount_cents || typeof amount_cents !== "number" || amount_cents < 50) {
      return NextResponse.json(
        { error: "El importe mínimo es 0,50 €." },
        { status: 400 }
      );
    }

    if (amount_cents > 50000) {
      return NextResponse.json(
        { error: "El importe máximo es 500,00 €." },
        { status: 400 }
      );
    }

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: amount_cents,
      currency: "eur",
      metadata: {
        restaurant_id,
        source: "mipropina",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Record pending tip in Supabase
    await supabaseAdmin.from("tip").insert({
      restaurant_id,
      amount_cents,
      stripe_payment_id: paymentIntent.id,
      status: "pending",
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("[create-payment] Error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
