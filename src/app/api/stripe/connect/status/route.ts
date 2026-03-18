import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("account_id");

    if (!accountId) {
      return NextResponse.json(
        { error: "account_id es obligatorio." },
        { status: 400 }
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
      { error: message },
      { status: 500 }
    );
  }
}
