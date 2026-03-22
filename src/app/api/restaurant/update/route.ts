import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireOwner } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "El ID del restaurante es obligatorio." },
        { status: 400 }
      );
    }

    const { auth, error: authError } = await requireOwner(id);
    if (authError) return authError;

    // Build update object with only provided fields
    const updates: Record<string, string> = {};

    if (body.name?.trim()) updates.name = body.name.trim();
    if (body.logo_emoji) updates.logo_emoji = body.logo_emoji;
    if (body.logo_url) updates.logo_url = body.logo_url;

    // Slug requires uniqueness check
    if (body.slug?.trim()) {
      const { data: existingSlug } = await supabaseAdmin
        .from("restaurant")
        .select("id")
        .eq("slug", body.slug.trim())
        .neq("id", id)
        .single();

      if (existingSlug) {
        return NextResponse.json(
          { error: "Esta URL ya está en uso por otro restaurante." },
          { status: 409 }
        );
      }
      updates.slug = body.slug.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No hay campos para actualizar." },
        { status: 400 }
      );
    }

    const { data: restaurant, error } = await supabaseAdmin
      .from("restaurant")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[restaurant/update] Error:", error);
      return NextResponse.json(
        { error: "Error al actualizar el restaurante." },
        { status: 500 }
      );
    }

    return NextResponse.json({ restaurant });
  } catch (error) {
    console.error("[restaurant/update] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
