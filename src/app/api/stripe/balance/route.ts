import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { requireOwner } from "@/lib/auth";
import { getRestaurantTipLedger } from "@/lib/balances";

export async function GET() {
  try {
    const { auth, error: authError } = await requireOwner();
    if (authError) return authError;

    const ledger = await getRestaurantTipLedger(auth.restaurantId);
    const balance = await getStripe().balance.retrieve();

    const platformAvailable = balance.available
      .filter((b) => b.currency === "eur")
      .reduce((sum, b) => sum + b.amount, 0);

    const transferableNow = Math.min(ledger.availableCents, platformAvailable);
    const waitingForStripe = Math.max(0, ledger.availableCents - transferableNow);

    return NextResponse.json({
      available_cents: transferableNow,
      pending_cents: waitingForStripe,
      restaurant_available_cents: ledger.availableCents,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("[balance] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
