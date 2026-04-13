import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireOwner } from "@/lib/auth";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "El ID del miembro es obligatorio." },
        { status: 400 }
      );
    }

    const { auth, error: authError } = await requireOwner();
    if (authError) return authError;

    // Check staff exists and is not owner
    const { data: staff, error: fetchError } = await supabaseAdmin
      .from("staff")
      .select("id, role, restaurant_id")
      .eq("id", id)
      .single();

    if (fetchError || !staff) {
      return NextResponse.json(
        { error: "Miembro no encontrado." },
        { status: 404 }
      );
    }

    if (staff.role === "owner") {
      return NextResponse.json(
        { error: "No se puede eliminar al gerente." },
        { status: 403 }
      );
    }

    if (staff.restaurant_id !== auth.restaurantId) {
      return NextResponse.json({ error: "No tienes acceso a este miembro." }, { status: 403 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from("staff")
      .update({ active: false })
      .eq("id", id);

    if (deleteError) {
      console.error("[staff/delete] Error:", deleteError);
      return NextResponse.json(
        { error: "Error al dar de baja al miembro." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[staff/delete] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
