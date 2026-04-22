import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";

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

    const { auth, error: authError } = await requireAuth();
    if (authError) return authError;

    const isSelf = auth.staffId === id;
    const isOwner = auth.role === "owner";

    // Only owner or the member themselves can update a profile
    if (!isSelf && !isOwner) {
      return NextResponse.json({ error: "Solo puedes modificar tu propio perfil." }, { status: 403 });
    }

    // Only owners can change active status
    if (!isOwner && active !== undefined) {
      return NextResponse.json({ error: "No tienes permiso para cambiar el estado del miembro." }, { status: 403 });
    }

    // Verify staff belongs to same restaurant
    const { data: targetStaff } = await supabaseAdmin
      .from("staff")
      .select("restaurant_id")
      .eq("id", id)
      .single();
    if (!targetStaff || targetStaff.restaurant_id !== auth.restaurantId) {
      return NextResponse.json({ error: "No tienes acceso a este miembro." }, { status: 403 });
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};
    if (iban !== undefined) updates.iban = iban?.trim() || null;
    if (isOwner && email !== undefined) updates.email = email.trim();
    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone?.trim() || null;
    if (avatar_emoji !== undefined) updates.avatar_emoji = avatar_emoji;
    if (isOwner && active !== undefined) updates.active = active;

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
