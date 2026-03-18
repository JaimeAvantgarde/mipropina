import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, slug, logo_emoji } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "El ID del restaurante es obligatorio." },
        { status: 400 }
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "El nombre es obligatorio." },
        { status: 400 }
      );
    }

    if (!slug?.trim()) {
      return NextResponse.json(
        { error: "La URL (slug) es obligatoria." },
        { status: 400 }
      );
    }

    // Check slug uniqueness (excluding current restaurant)
    const { data: existingSlug } = await supabaseAdmin
      .from("restaurant")
      .select("id")
      .eq("slug", slug.trim())
      .neq("id", id)
      .single();

    if (existingSlug) {
      return NextResponse.json(
        { error: "Esta URL ya está en uso por otro restaurante." },
        { status: 409 }
      );
    }

    const { data: restaurant, error } = await supabaseAdmin
      .from("restaurant")
      .update({
        name: name.trim(),
        slug: slug.trim(),
        logo_emoji: logo_emoji || "🍽️",
      })
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
