import { NextResponse } from "next/server";
import { getWhatsAppLink } from "@/lib/utils";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireOwner } from "@/lib/auth";

import { randomBytes } from "crypto";

function generateToken(): string {
  return randomBytes(16).toString("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurant_id, restaurant_name, name, phone } = body;

    if (!restaurant_id || typeof restaurant_id !== "string") {
      return NextResponse.json(
        { error: "restaurant_id es obligatorio." },
        { status: 400 }
      );
    }

    const { auth, error: authError } = await requireOwner(restaurant_id);
    if (authError) return authError;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "El nombre es obligatorio (mínimo 2 caracteres)." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "El teléfono es obligatorio." },
        { status: 400 }
      );
    }

    const token = generateToken();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mipropina.es";
    const inviteLink = `${appUrl}/auth/registro?token=${token}`;

    // Insert invite into database
    const { error: insertError } = await supabaseAdmin.from("invite_code").insert({
      restaurant_id,
      code: token,
      name: name.trim(),
      phone,
      used: false,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (insertError) {
      console.error("[invite] Insert error:", insertError);
      return NextResponse.json(
        { error: "Error al guardar la invitación." },
        { status: 500 }
      );
    }

    const rName = restaurant_name || "mipropina";
    const message = `¡Hola ${name.trim()}! Te invitan a unirte al equipo de ${rName} en mipropina. Entra aquí para registrarte:\n\n${inviteLink}`;

    const whatsapp_link = getWhatsAppLink(phone, message);

    return NextResponse.json({
      token,
      invite_link: inviteLink,
      whatsapp_link,
    });
  } catch (error) {
    console.error("[invite] Error:", error);
    return NextResponse.json(
      { error: "Error al generar la invitación." },
      { status: 500 }
    );
  }
}
