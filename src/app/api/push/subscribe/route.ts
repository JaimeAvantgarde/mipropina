import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { auth, error: authError } = await requireAuth();
    if (authError) return authError;

    const body = await request.json();
    const { endpoint, p256dh, auth: pushAuth } = body;

    if (!endpoint || !p256dh || !pushAuth) {
      return NextResponse.json(
        { error: "Datos de suscripción incompletos." },
        { status: 400 }
      );
    }

    // Upsert: if this endpoint already exists, update keys
    const { error } = await supabaseAdmin
      .from("push_subscription")
      .upsert(
        {
          staff_id: auth.staffId,
          restaurant_id: auth.restaurantId,
          endpoint,
          p256dh,
          auth: pushAuth,
        },
        { onConflict: "endpoint" }
      );

    if (error) {
      console.error("[push/subscribe] Error:", error);
      return NextResponse.json(
        { error: "Error al guardar la suscripción." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[push/subscribe] Error:", error);
    return NextResponse.json(
      { error: "Error al procesar la suscripción." },
      { status: 500 }
    );
  }
}
