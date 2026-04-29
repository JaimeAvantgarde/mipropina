import { supabaseAdmin } from "@/lib/supabase/admin";

type TipRow = {
  amount_cents: number;
  platform_fee_cents: number | null;
};

type DistributionRow = {
  id: string;
  total_cents: number;
  status: string;
};

type PayoutRow = {
  distribution_id: string;
  amount_cents: number;
  status: string;
};

export type RestaurantTipLedger = {
  grossTipCents: number;
  platformFeeCents: number;
  netTipCents: number;
  sentPayoutCents: number;
  manualDistributedCents: number;
  allocatedCents: number;
  availableCents: number;
};

export async function getRestaurantTipLedger(
  restaurantId: string
): Promise<RestaurantTipLedger> {
  const { data: completedTips, error: tipsError } = await supabaseAdmin
    .from("tip")
    .select("amount_cents, platform_fee_cents")
    .eq("restaurant_id", restaurantId)
    .eq("status", "completed");

  if (tipsError) {
    throw new Error("No se pudo calcular el saldo de propinas.");
  }

  const tips = (completedTips || []) as TipRow[];
  const grossTipCents = tips.reduce((sum, tip) => sum + tip.amount_cents, 0);
  const platformFeeCents = tips.reduce(
    (sum, tip) => sum + (tip.platform_fee_cents || 0),
    0
  );
  const netTipCents = grossTipCents - platformFeeCents;

  const { data: distributions, error: distributionsError } = await supabaseAdmin
    .from("distribution")
    .select("id, total_cents, status")
    .eq("restaurant_id", restaurantId);

  if (distributionsError) {
    throw new Error("No se pudo calcular el saldo repartido.");
  }

  const distributionRows = (distributions || []) as DistributionRow[];
  const distributionIds = distributionRows.map((distribution) => distribution.id);

  let sentPayoutCents = 0;
  const distributionIdsWithSentPayouts = new Set<string>();

  if (distributionIds.length > 0) {
    const { data: payouts, error: payoutsError } = await supabaseAdmin
      .from("payout")
      .select("distribution_id, amount_cents, status")
      .in("distribution_id", distributionIds)
      .eq("status", "sent");

    if (payoutsError) {
      throw new Error("No se pudo calcular el saldo transferido.");
    }

    for (const payout of (payouts || []) as PayoutRow[]) {
      sentPayoutCents += payout.amount_cents;
      distributionIdsWithSentPayouts.add(payout.distribution_id);
    }
  }

  const manualDistributedCents = distributionRows
    .filter(
      (distribution) =>
        distribution.status === "distributed" &&
        !distributionIdsWithSentPayouts.has(distribution.id)
    )
    .reduce((sum, distribution) => sum + distribution.total_cents, 0);

  const allocatedCents = sentPayoutCents + manualDistributedCents;

  return {
    grossTipCents,
    platformFeeCents,
    netTipCents,
    sentPayoutCents,
    manualDistributedCents,
    allocatedCents,
    availableCents: Math.max(0, netTipCents - allocatedCents),
  };
}
