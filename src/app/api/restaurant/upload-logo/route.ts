import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireOwner } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const restaurantId = formData.get("restaurant_id") as string;

    if (!file || !restaurantId) {
      return NextResponse.json(
        { error: "Archivo y restaurant_id son obligatorios." },
        { status: 400 }
      );
    }

    const { auth, error: authError } = await requireOwner(restaurantId);
    if (authError) return authError;

    const ext = file.name.split(".").pop() || "jpg";
    const path = `restaurants/${restaurantId}/logo.${ext}`;

    // Upload using admin client (bypasses RLS)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("logos")
      .upload(path, buffer, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("[upload-logo] Upload error:", uploadError);
      return NextResponse.json(
        { error: "Error al subir la imagen." },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("logos")
      .getPublicUrl(path);

    // Update restaurant record
    await supabaseAdmin
      .from("restaurant")
      .update({ logo_url: urlData.publicUrl })
      .eq("id", restaurantId);

    return NextResponse.json({ logo_url: urlData.publicUrl });
  } catch (error) {
    console.error("[upload-logo] Error:", error);
    return NextResponse.json(
      { error: "Error al procesar la imagen." },
      { status: 500 }
    );
  }
}
