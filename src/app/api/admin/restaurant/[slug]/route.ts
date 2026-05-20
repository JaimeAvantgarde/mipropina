import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { findActiveInvite, normalizePhone } from "@/lib/invite";

function whatsappUrlFor(phone: string, name: string, restaurantName: string, token: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "https://mipropina.es").replace(/\/+$/, "");
  const url = `${base}/i/${token}`;
  const msg = `Hola ${name}, te invito a gestionar ${restaurantName} en mipropina. Abre este enlace para entrar:\n${url}`;
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { slug } = await params;

  try {
    const { data: restaurant } = await supabaseAdmin
      .from("restaurant")
      .select("*")
      .eq("slug", slug)
      .is("deleted_at", null)
      .single();

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurante no encontrado." },
        { status: 404 }
      );
    }

    const { data: staff } = await supabaseAdmin
      .from("staff")
      .select(
        "id, name, email, phone, role, avatar_emoji, active, status, stripe_payout_id, created_at"
      )
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: true });

    const { data: tips } = await supabaseAdmin
      .from("tip")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false })
      .limit(100);

    const { data: distributions } = await supabaseAdmin
      .from("distribution")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false });

    const distributionIds = (distributions || []).map((d) => d.id);
    const { data: payouts } = distributionIds.length > 0
      ? await supabaseAdmin
          .from("payout")
          .select("*")
          .in("distribution_id", distributionIds)
      : { data: [] };

    const completedTips = (tips || []).filter((t) => t.status === "completed");
    const totalTipsCents = completedTips.reduce((sum, t) => sum + t.amount_cents, 0);
    const totalFeesCents = completedTips.reduce(
      (sum, t) => sum + (t.platform_fee_cents || 0),
      0
    );
    const netCents = totalTipsCents - totalFeesCents;
    const distributedCents = (distributions || [])
      .filter((d) => d.status === "distributed")
      .reduce((sum, d) => sum + d.total_cents, 0);
    const availableCents = netCents - distributedCents;

    // Pending manager invite (if any)
    const pendingManagerInvite = restaurant.manager_id
      ? null
      : await findActiveInvite({
          restaurantId: restaurant.id as string,
          role: "manager",
        });

    const pendingInvite = pendingManagerInvite
      ? {
          id: pendingManagerInvite.id,
          token: pendingManagerInvite.token,
          name: pendingManagerInvite.name,
          phone: pendingManagerInvite.phone,
          expires_at: pendingManagerInvite.expires_at,
          whatsapp_url: whatsappUrlFor(
            normalizePhone(pendingManagerInvite.phone) || pendingManagerInvite.phone,
            pendingManagerInvite.name,
            restaurant.name as string,
            pendingManagerInvite.token
          ),
        }
      : null;

    return NextResponse.json({
      restaurant,
      staff: staff || [],
      tips: tips || [],
      distributions: (distributions || []).map((d) => ({
        ...d,
        payouts: (payouts || []).filter((p) => p.distribution_id === d.id),
      })),
      stats: {
        total_tips_cents: totalTipsCents,
        total_fees_cents: totalFeesCents,
        net_cents: netCents,
        distributed_cents: distributedCents,
        available_cents: availableCents,
        tips_count: completedTips.length,
      },
      pending_manager_invite: pendingInvite,
    });
  } catch (error) {
    console.error("[admin/restaurant] Error:", error);
    return NextResponse.json(
      { error: "Error al cargar datos del restaurante." },
      { status: 500 }
    );
  }
}
