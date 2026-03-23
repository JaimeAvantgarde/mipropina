import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { CLIENT_FEE_CENTS } from "@/lib/utils";

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

    const charge_amount = amount_cents + CLIENT_FEE_CENTS;

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: charge_amount,
      currency: "eur",
      metadata: {
        restaurant_id,
        source: "mipropina",
        tip_amount_cents: String(amount_cents),
        client_fee_cents: String(CLIENT_FEE_CENTS),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Tip record is created in the webhook when payment succeeds
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
