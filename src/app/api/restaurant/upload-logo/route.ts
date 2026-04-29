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

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Solo se permiten imágenes JPG, PNG o WebP." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "El archivo no puede superar 5 MB." },
        { status: 400 }
      );
    }

    const { error: authError } = await requireOwner(restaurantId);
    if (authError) return authError;

    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const ext = extMap[file.type] || "jpg";
    const path = `restaurants/${restaurantId}/logo.${ext}`;

    // Upload using admin client (bypasses RLS)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isJpeg = buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isWebp = buffer.length > 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";

    if (
      (file.type === "image/jpeg" && !isJpeg) ||
      (file.type === "image/png" && !isPng) ||
      (file.type === "image/webp" && !isWebp)
    ) {
      return NextResponse.json(
        { error: "El archivo no coincide con el tipo de imagen declarado." },
        { status: 400 }
      );
    }

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
