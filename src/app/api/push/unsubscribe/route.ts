import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { auth, error: authError } = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint es obligatorio." },
        { status: 400 }
      );
    }

    await supabaseAdmin
      .from("push_subscription")
      .delete()
      .eq("endpoint", endpoint)
      .eq("staff_id", auth.staffId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[push/unsubscribe] Error:", error);
    return NextResponse.json(
      { error: "Error al procesar la cancelación." },
      { status: 500 }
    );
  }
}
