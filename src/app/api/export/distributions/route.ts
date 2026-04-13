import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireOwner } from "@/lib/auth";

export async function GET() {
  const { auth, error: authError } = await requireOwner();
  if (authError) return authError;

  const { data: distributions, error } = await supabaseAdmin
    .from("distribution")
    .select(`
      id, week_start, week_end, total_cents, method, status, created_at,
      payout ( amount_cents, status, staff ( name ) )
    `)
    .eq("restaurant_id", auth.restaurantId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Error al obtener los repartos." }, { status: 500 });
  }

  const rows = [
    ["Fecha", "Semana inicio", "Semana fin", "Total (€)", "Metodo", "Estado", "Camareros"].join(";"),
    ...(distributions || []).map((d) => {
      const date = new Date(d.created_at).toLocaleDateString("es-ES");
      const total = (d.total_cents / 100).toFixed(2);
      const waiters = (d.payout || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((p: any) => `${p.staff?.name || "?"} ${(p.amount_cents / 100).toFixed(2)}€`)
        .join(" | ");
      return [date, d.week_start, d.week_end, total, d.method, d.status, waiters].join(";");
    }),
  ];

  const csv = rows.join("\n");
  const filename = `repartos-${new Date().toISOString().split("T")[0]}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
