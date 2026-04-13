import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireOwner } from "@/lib/auth";

export async function GET() {
  const { auth, error: authError } = await requireOwner();
  if (authError) return authError;

  const { data: tips, error } = await supabaseAdmin
    .from("tip")
    .select("id, amount_cents, platform_fee_cents, stripe_payment_id, status, created_at")
    .eq("restaurant_id", auth.restaurantId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Error al obtener las propinas." }, { status: 500 });
  }

  const rows = [
    ["Fecha", "Propina (€)", "Comision plataforma (€)", "Neto (€)", "Estado", "ID Stripe"].join(";"),
    ...(tips || []).map((t) => {
      const amount = (t.amount_cents / 100).toFixed(2);
      const fee = ((t.platform_fee_cents || 0) / 100).toFixed(2);
      const net = ((t.amount_cents - (t.platform_fee_cents || 0)) / 100).toFixed(2);
      const date = new Date(t.created_at).toLocaleDateString("es-ES");
      return [date, amount, fee, net, t.status, t.stripe_payment_id || ""].join(";");
    }),
  ];

  const csv = rows.join("\n");
  const filename = `propinas-${new Date().toISOString().split("T")[0]}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
