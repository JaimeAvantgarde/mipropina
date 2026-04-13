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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {};

    if (body.name?.trim()) updates.name = body.name.trim();
    if (body.logo_emoji) updates.logo_emoji = body.logo_emoji;
    if (body.logo_url !== undefined) updates.logo_url = body.logo_url;

    // Validate and apply hex color
    if (body.theme_color && /^#[0-9A-Fa-f]{6}$/.test(body.theme_color)) {
      updates.theme_color = body.theme_color;
    }

    // Slug requires uniqueness check
    if (body.slug?.trim()) {
      const { data: existingSlug } = await supabaseAdmin
        .from("restaurant")
        .select("id")
        .eq("slug", body.slug.trim())
        .neq("id", id)
        .maybeSingle();

      if (existingSlug) {
        return NextResponse.json(
          { error: "Esta URL ya está en uso por otro restaurante." },
          { status: 409 }
        );
      }
      updates.slug = body.slug.trim();
    }

    // Configurable tip amounts (array of 2–8 amounts between 0.50€ and 500€)
    if (Array.isArray(body.tip_amounts)) {
      const amounts = body.tip_amounts
        .map(Number)
        .filter((n: number) => Number.isInteger(n) && n >= 50 && n <= 50000);
      if (amounts.length >= 2 && amounts.length <= 8) {
        updates.tip_amounts = amounts;
      }
    }

    // Toggle custom amount input
    if (typeof body.custom_amount_enabled === "boolean") {
      updates.custom_amount_enabled = body.custom_amount_enabled;
    }

    // Custom thank-you message (max 300 chars)
    if (typeof body.thank_you_message === "string") {
      updates.thank_you_message = body.thank_you_message.slice(0, 300).trim() || null;
    }

    // Email notification settings
    if (typeof body.email_notifications_enabled === "boolean") {
      updates.email_notifications_enabled = body.email_notifications_enabled;
    }
    if (body.notification_email !== undefined) {
      const email = body.notification_email?.trim() || null;
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: "El email de notificaciones no es válido." },
          { status: 400 }
        );
      }
      updates.notification_email = email;
    }

    // Google Maps review URL
    if (body.google_maps_url !== undefined) {
      const url = body.google_maps_url?.trim() || null;
      if (url && !/^https?:\/\/(maps\.google\.|g\.page|www\.google\.[a-z]+\/maps)/.test(url)) {
        return NextResponse.json(
          { error: "La URL de Google Maps no parece válida." },
          { status: 400 }
        );
      }
      updates.google_maps_url = url;
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
