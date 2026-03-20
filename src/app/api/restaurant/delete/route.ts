import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "El ID del restaurante es obligatorio." },
        { status: 400 }
      );
    }

    // Verify the user is the owner of this restaurant
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado." },
        { status: 401 }
      );
    }

    const { data: staffRecord } = await supabaseAdmin
      .from("staff")
      .select("role, restaurant_id")
      .eq("auth_user_id", user.id)
      .eq("restaurant_id", id)
      .single();

    if (!staffRecord || staffRecord.role !== "owner") {
      return NextResponse.json(
        { error: "Solo el gerente puede eliminar el restaurante." },
        { status: 403 }
      );
    }

    // Delete in order: payouts → distributions → tips → invite_codes → qr_codes → staff → restaurant
    // (respecting foreign key constraints)
    await supabaseAdmin
      .from("payout")
      .delete()
      .in("distribution_id",
        (await supabaseAdmin.from("distribution").select("id").eq("restaurant_id", id)).data?.map((d: { id: string }) => d.id) || []
      );

    await supabaseAdmin.from("distribution").delete().eq("restaurant_id", id);
    await supabaseAdmin.from("tip").delete().eq("restaurant_id", id);
    await supabaseAdmin.from("invite_code").delete().eq("restaurant_id", id);
    await supabaseAdmin.from("qr_code").delete().eq("restaurant_id", id);
    await supabaseAdmin.from("staff").delete().eq("restaurant_id", id);

    // Delete logo from storage
    const { data: restaurant } = await supabaseAdmin
      .from("restaurant")
      .select("logo_url")
      .eq("id", id)
      .single();

    if (restaurant?.logo_url) {
      const path = `restaurants/${id}`;
      const { data: files } = await supabaseAdmin.storage.from("logos").list(path);
      if (files?.length) {
        await supabaseAdmin.storage.from("logos").remove(files.map((f: { name: string }) => `${path}/${f.name}`));
      }
    }

    // Finally delete the restaurant
    const { error } = await supabaseAdmin.from("restaurant").delete().eq("id", id);

    if (error) {
      console.error("[restaurant/delete] Error:", error);
      return NextResponse.json(
        { error: "Error al eliminar el restaurante." },
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
