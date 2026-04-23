import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const { auth, error: authError } = await requireAuth();
    if (authError) return authError;

    const { data: payouts, error } = await supabaseAdmin
      .from("payout")
      .select("amount_cents, status, paid_at")
      .eq("staff_id", auth.staffId)
      .eq("status", "sent")
      .order("paid_at", { ascending: false });

    if (error) {
      console.error("[staff/my-payouts] Error:", error);
      return NextResponse.json({ error: "Error al cargar los repartos." }, { status: 500 });
    }

    const totalCents = (payouts || []).reduce((sum, p) => sum + p.amount_cents, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const weekCents = (payouts || [])
      .filter((p) => p.paid_at && new Date(p.paid_at) >= weekStart)
      .reduce((sum, p) => sum + p.amount_cents, 0);

    return NextResponse.json({ payouts, totalCents, weekCents });
  } catch (error) {
    console.error("[staff/my-payouts] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
