import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, iban, email, name, phone, avatar_emoji, active } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "El ID del miembro es obligatorio." },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};
    if (iban !== undefined) updates.iban = iban?.trim() || null;
    if (email !== undefined) updates.email = email.trim();
    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone?.trim() || null;
    if (avatar_emoji !== undefined) updates.avatar_emoji = avatar_emoji;
    if (active !== undefined) updates.active = active;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No hay campos para actualizar." },
        { status: 400 }
      );
    }

    const { data: staff, error } = await supabaseAdmin
      .from("staff")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[staff/update] Error:", error);
      return NextResponse.json(
        { error: "Error al actualizar el perfil." },
        { status: 500 }
      );
    }

    return NextResponse.json({ staff });
  } catch (error) {
    console.error("[staff/update] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
