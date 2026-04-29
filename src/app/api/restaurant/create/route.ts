import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, logo_emoji, owner_name, owner_email, owner_phone } = body;

    // Require authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para crear un restaurante." },
        { status: 401 }
      );
    }
    const authUserId = user.id;

    // Validate required fields
    if (!name?.trim() || !slug?.trim() || !owner_name?.trim() || !owner_email?.trim()) {
      return NextResponse.json(
        { error: "Nombre del restaurante, URL, nombre del propietario y email son obligatorios." },
        { status: 400 }
      );
    }

    const cleanSlug = slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      return NextResponse.json(
        { error: "La URL solo puede contener letras, números y guiones." },
        { status: 400 }
      );
    }

    // Check if slug is already taken
    const { data: existingSlug } = await supabaseAdmin
      .from("restaurant")
      .select("id")
      .eq("slug", cleanSlug)
      .maybeSingle();

    if (existingSlug) {
      return NextResponse.json(
        { error: "Esta URL ya está en uso. Elige otra." },
        { status: 409 }
      );
    }

    // Create the restaurant (without owner_id initially)
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from("restaurant")
      .insert({
        name: name.trim(),
        slug: cleanSlug,
        logo_emoji: logo_emoji || "🍽️",
        theme_color: "#2ECC87",
      })
      .select()
      .single();

    if (restaurantError) {
      console.error("[restaurant/create] Restaurant insert error:", restaurantError);
      return NextResponse.json(
        { error: "Error al crear el restaurante." },
        { status: 500 }
      );
    }

    // Create the owner staff record
    const { data: staff, error: staffError } = await supabaseAdmin
      .from("staff")
      .insert({
        restaurant_id: restaurant.id,
        auth_user_id: authUserId,
        name: owner_name.trim(),
        email: owner_email.trim(),
        phone: owner_phone?.trim() || null,
        role: "owner",
        avatar_emoji: "👩‍🍳",
      })
      .select()
      .single();

    if (staffError) {
      console.error("[restaurant/create] Staff insert error:", staffError);
      // Rollback: delete the restaurant
      await supabaseAdmin.from("restaurant").delete().eq("id", restaurant.id);
      return NextResponse.json(
        { error: "Error al crear el perfil del propietario." },
        { status: 500 }
      );
    }

    // Update restaurant with owner_id
    await supabaseAdmin
      .from("restaurant")
      .update({ owner_id: staff.id })
      .eq("id", restaurant.id);

    // Create default QR code
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mipropina.es";
    await supabaseAdmin.from("qr_code").insert({
      restaurant_id: restaurant.id,
      table_label: "Mesa 1",
      url: `${appUrl}/t/${cleanSlug}?mesa=1`,
    });

    return NextResponse.json({
      restaurant: { ...restaurant, owner_id: staff.id },
      staff,
    });
  } catch (error) {
    console.error("[restaurant/create] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
