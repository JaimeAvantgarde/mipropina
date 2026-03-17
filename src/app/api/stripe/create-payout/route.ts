import { NextResponse } from "next/server";

type PayoutEntry = {
  staff_id: string;
  amount_cents: number;
  stripe_account_id: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { distribution_id, payouts } = body as {
      distribution_id: string;
      payouts: PayoutEntry[];
    };

    if (!distribution_id || typeof distribution_id !== "string") {
      return NextResponse.json(
        { error: "distribution_id es obligatorio." },
        { status: 400 }
      );
    }

    if (!Array.isArray(payouts) || payouts.length === 0) {
      return NextResponse.json(
        { error: "Se necesita al menos un pago." },
        { status: 400 }
      );
    }

    // Validate each payout entry
    for (const payout of payouts) {
      if (!payout.staff_id || !payout.amount_cents || !payout.stripe_account_id) {
        return NextResponse.json(
          { error: "Cada pago necesita staff_id, amount_cents y stripe_account_id." },
          { status: 400 }
        );
      }
      if (payout.amount_cents < 50) {
        return NextResponse.json(
          { error: "El importe mínimo por pago es 0,50 €." },
          { status: 400 }
        );
      }
    }

    // TODO: Create Stripe transfers for each payout
    // for (const payout of payouts) {
    //   const transfer = await stripe.transfers.create({
    //     amount: payout.amount_cents,
    //     currency: "eur",
    //     destination: payout.stripe_account_id,
    //     metadata: {
    //       distribution_id,
    //       staff_id: payout.staff_id,
    //     },
    //   });
    //   // Update payout record with transfer ID
    //   await supabaseAdmin.from("payouts").update({
    //     stripe_transfer_id: transfer.id,
    //     status: "sent",
    //     paid_at: new Date().toISOString(),
    //   }).eq("id", payout.staff_id);
    // }

    const results = payouts.map((p) => ({
      staff_id: p.staff_id,
      amount_cents: p.amount_cents,
      status: "pending" as const,
    }));

    return NextResponse.json({
      distribution_id,
      payouts: results,
      message: "Pagos encolados correctamente.",
    });
  } catch (error) {
    console.error("[create-payout] Error:", error);
    return NextResponse.json(
      { error: "Error al procesar los pagos." },
      { status: 500 }
    );
  }
}
