import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireOwner } from "@/lib/auth";
import { sendPushToRestaurant } from "@/lib/push";
import { getRestaurantTipLedger } from "@/lib/balances";
import { formatCentsShort } from "@/lib/utils";

type PayoutInput = {
  staff_id: string;
  amount_cents: number;
};

type StaffRecord = {
  id: string;
  stripe_payout_id: string | null;
  name: string;
};

function normalizePayouts(value: unknown): PayoutInput[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;

  const payouts = value.map((entry) => {
    if (!entry || typeof entry !== "object") return null;
    const payout = entry as Record<string, unknown>;
    const staffId = payout.staff_id;
    const amountCents = payout.amount_cents;

    if (typeof staffId !== "string") return null;
    if (typeof amountCents !== "number" || !Number.isInteger(amountCents) || amountCents <= 0) return null;

    return { staff_id: staffId, amount_cents: amountCents };
  });

  if (payouts.some((payout) => payout === null)) return null;

  const byStaffId = new Map<string, number>();
  for (const payout of payouts as PayoutInput[]) {
    byStaffId.set(
      payout.staff_id,
      (byStaffId.get(payout.staff_id) || 0) + payout.amount_cents
    );
  }

  return [...byStaffId.entries()]
    .map(([staff_id, amount_cents]) => ({ staff_id, amount_cents }))
    .sort((a, b) => a.staff_id.localeCompare(b.staff_id));
}

function createPayoutRequestHash(
  restaurantId: string,
  method: string,
  payouts: PayoutInput[],
  availableCents: number
) {
  return createHash("sha256")
    .update(JSON.stringify({ restaurantId, method, payouts, availableCents }))
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurant_id } = body;
    const method = body.method === "equal" ? "equal" : "custom";
    const payouts = normalizePayouts(body.payouts);

    if (!restaurant_id || typeof restaurant_id !== "string" || !payouts) {
      return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
    }

    const { auth, error: authError } = await requireOwner(restaurant_id);
    if (authError) return authError;

    const totalCentsRequested = payouts.reduce(
      (sum, payout) => sum + payout.amount_cents,
      0
    );

    const ledger = await getRestaurantTipLedger(restaurant_id);

    if (totalCentsRequested > ledger.availableCents) {
      return NextResponse.json(
        {
          error: `Excede el saldo del restaurante. Disponible para repartir: ${(ledger.availableCents / 100).toFixed(2)}€.`,
          available_cents: ledger.availableCents,
        },
        { status: 400 }
      );
    }

    const balance = await getStripe().balance.retrieve();
    const stripeAvailableCents = balance.available
      .filter((entry) => entry.currency === "eur")
      .reduce((sum, entry) => sum + entry.amount, 0);

    if (stripeAvailableCents < totalCentsRequested) {
      return NextResponse.json(
        {
          error: `Balance insuficiente en Stripe. Disponible para transferir ahora: ${(Math.min(stripeAvailableCents, ledger.availableCents) / 100).toFixed(2)}€. El dinero de las propinas tarda ~2 días laborables en estar disponible para repartir.`,
          available_cents: Math.min(stripeAvailableCents, ledger.availableCents),
        },
        { status: 400 }
      );
    }

    const staffIds = payouts.map((payout) => payout.staff_id);
    const { data: staffRecords } = await supabaseAdmin
      .from("staff")
      .select("id, stripe_payout_id, name")
      .in("id", staffIds)
      .eq("restaurant_id", restaurant_id)
      .eq("active", true);

    if (!staffRecords || staffRecords.length !== staffIds.length) {
      return NextResponse.json(
        { error: "Algunos camareros no pertenecen a este restaurante." },
        { status: 403 }
      );
    }

    const requestHash = createPayoutRequestHash(
      restaurant_id,
      method,
      payouts,
      ledger.availableCents
    );

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

    const { data: distribution, error: distError } = await supabaseAdmin
      .from("distribution")
      .insert({
        restaurant_id,
        week_start: weekStart.toISOString().split("T")[0],
        week_end: now.toISOString().split("T")[0],
        total_cents: totalCentsRequested,
        method,
        status: "pending",
        created_by: auth.staffId,
        request_hash: requestHash,
      })
      .select()
      .single();

    if (distError || !distribution) {
      if (distError?.code === "23505") {
        return NextResponse.json(
          { error: "Este reparto ya se está procesando o ya fue ejecutado." },
          { status: 409 }
        );
      }

      console.error("[create-payout] Distribution insert error:", distError);
      return NextResponse.json(
        { error: "Error al crear la distribución." },
        { status: 500 }
      );
    }

    const staffById = new Map(
      (staffRecords as StaffRecord[]).map((staff) => [staff.id, staff])
    );
    const results: {
      staff_id: string;
      status: "sent" | "failed";
      transfer_id?: string;
      error?: string;
    }[] = [];

    for (const payout of payouts) {
      const staff = staffById.get(payout.staff_id);

      if (!staff?.stripe_payout_id) {
        await supabaseAdmin.from("payout").insert({
          distribution_id: distribution.id,
          staff_id: payout.staff_id,
          amount_cents: payout.amount_cents,
          status: "failed",
        });
        results.push({
          staff_id: payout.staff_id,
          status: "failed",
          error: "No Stripe account",
        });
        continue;
      }

      try {
        const idempotencyKey = `payout-${requestHash}-${payout.staff_id}`;
        const transfer = await getStripe().transfers.create(
          {
            amount: payout.amount_cents,
            currency: "eur",
            destination: staff.stripe_payout_id,
            metadata: {
              distribution_id: distribution.id,
              staff_id: payout.staff_id,
              restaurant_id,
              request_hash: requestHash,
            },
          },
          { idempotencyKey }
        );

        await supabaseAdmin.from("payout").insert({
          distribution_id: distribution.id,
          staff_id: payout.staff_id,
          amount_cents: payout.amount_cents,
          stripe_transfer_id: transfer.id,
          status: "sent",
          paid_at: new Date().toISOString(),
        });

        results.push({
          staff_id: payout.staff_id,
          status: "sent",
          transfer_id: transfer.id,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error";

        await supabaseAdmin.from("payout").insert({
          distribution_id: distribution.id,
          staff_id: payout.staff_id,
          amount_cents: payout.amount_cents,
          status: "failed",
        });

        results.push({
          staff_id: payout.staff_id,
          status: "failed",
          error: message,
        });

        sendPushToRestaurant(restaurant_id, {
          title: "Transferencia fallida",
          body: `La transferencia a ${staff?.name || "un camarero"} de ${formatCentsShort(payout.amount_cents)} ha fallado`,
          url: "/dashboard/repartos",
          tag: `transfer-fail-${distribution.id}-${payout.staff_id}`,
        }).catch(() => {});
      }
    }

    const allSent = results.every((result) => result.status === "sent");
    await supabaseAdmin
      .from("distribution")
      .update({ status: allSent ? "distributed" : "pending" })
      .eq("id", distribution.id);

    return NextResponse.json({
      distribution_id: distribution.id,
      results,
      message: `${results.filter((result) => result.status === "sent").length} transferencias completadas.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("[create-payout] Error:", message);
    return NextResponse.json(
      { error: "Error al procesar el reparto." },
      { status: 500 }
    );
  }
}
