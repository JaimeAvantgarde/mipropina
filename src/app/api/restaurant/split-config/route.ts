import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireOwner } from "@/lib/auth";

type ShareInput = { staff_id: string; pct: number | null };

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { restaurant_id, split_includes_owner, shares } = body as {
      restaurant_id?: string;
      split_includes_owner?: boolean;
      shares?: ShareInput[];
    };

    if (!restaurant_id || typeof restaurant_id !== "string") {
      return NextResponse.json(
        { error: "Falta restaurant_id." },
        { status: 400 }
      );
    }

    const { error: authError } = await requireOwner(restaurant_id);
    if (authError) return authError;

    const cleanShares: ShareInput[] = Array.isArray(shares)
      ? shares
          .filter(
            (s): s is ShareInput =>
              !!s && typeof s.staff_id === "string" && s.staff_id.length > 0
          )
          .map((s) => {
            const raw = s.pct;
            if (raw === null || raw === undefined) {
              return { staff_id: s.staff_id, pct: null };
            }
            const n = Number(raw);
            if (!Number.isFinite(n)) return { staff_id: s.staff_id, pct: null };
            return { staff_id: s.staff_id, pct: Math.max(0, Math.min(100, n)) };
          })
      : [];

    const definedShares = cleanShares.filter((s) => s.pct !== null) as Array<{
      staff_id: string;
      pct: number;
    }>;

    if (definedShares.length > 0) {
      const total = definedShares.reduce((sum, s) => sum + s.pct, 0);
      if (Math.abs(total - 100) > 0.01) {
        return NextResponse.json(
          {
            error: `Los porcentajes deben sumar 100. Actualmente: ${total.toFixed(2)}.`,
          },
          { status: 400 }
        );
      }
    }

    if (typeof split_includes_owner === "boolean") {
      const { error: restErr } = await supabaseAdmin
        .from("restaurant")
        .update({ split_includes_owner })
        .eq("id", restaurant_id);
      if (restErr) {
        console.error("[split-config] restaurant update", restErr);
        return NextResponse.json(
          { error: "Error al guardar la configuración del restaurante." },
          { status: 500 }
        );
      }
    }

    // Reset all active staff for this restaurant so removed shares clear out,
    // then apply the new values.
    const { error: resetErr } = await supabaseAdmin
      .from("staff")
      .update({ default_share_pct: null })
      .eq("restaurant_id", restaurant_id);
    if (resetErr) {
      console.error("[split-config] reset shares", resetErr);
      return NextResponse.json(
        { error: "Error al limpiar la configuración previa." },
        { status: 500 }
      );
    }

    for (const share of definedShares) {
      const { error: updErr } = await supabaseAdmin
        .from("staff")
        .update({ default_share_pct: share.pct })
        .eq("id", share.staff_id)
        .eq("restaurant_id", restaurant_id);
      if (updErr) {
        console.error("[split-config] staff update", updErr);
        return NextResponse.json(
          { error: "Error al guardar los porcentajes." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[restaurant/split-config] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
