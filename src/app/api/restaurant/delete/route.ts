import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireOwner } from "@/lib/auth";

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "El ID del restaurante es obligatorio." },
        { status: 400 }
      );
    }

    const { error: authError } = await requireOwner(id);
    if (authError) return authError;

    const deletedAt = new Date().toISOString();

    const { error: restaurantError } = await supabaseAdmin
      .from("restaurant")
      .update({ deleted_at: deletedAt })
      .eq("id", id)
      .is("deleted_at", null);

    if (restaurantError) {
      console.error("[restaurant/delete] Error:", restaurantError);
      return NextResponse.json(
        { error: "Error al archivar el restaurante." },
        { status: 500 }
      );
    }

    const { error: staffError } = await supabaseAdmin
      .from("staff")
      .update({ active: false })
      .eq("restaurant_id", id);

    if (staffError) {
      console.error("[restaurant/delete] Staff archive error:", staffError);
      return NextResponse.json(
        { error: "Restaurante archivado, pero no se pudo desactivar el equipo." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[restaurant/delete] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
