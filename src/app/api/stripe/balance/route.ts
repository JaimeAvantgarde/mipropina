import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { requireOwner } from "@/lib/auth";

export async function GET() {
  try {
    const { error: authError } = await requireOwner();
    if (authError) return authError;

    const balance = await getStripe().balance.retrieve();

    const available = balance.available
      .filter((b) => b.currency === "eur")
      .reduce((sum, b) => sum + b.amount, 0);

    const pending = balance.pending
      .filter((b) => b.currency === "eur")
      .reduce((sum, b) => sum + b.amount, 0);

    return NextResponse.json({ available_cents: available, pending_cents: pending });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("[balance] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
