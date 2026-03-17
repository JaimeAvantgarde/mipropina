import { NextResponse } from "next/server";
import { generateInviteCode, getWhatsAppLink } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurant_id, name, phone } = body;

    if (!restaurant_id || typeof restaurant_id !== "string") {
      return NextResponse.json(
        { error: "restaurant_id es obligatorio." },
        { status: 400 }
      );
    }

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

    const code = generateInviteCode("MP");

    // TODO: Insert invite code into database
    // await supabaseAdmin.from("invite_codes").insert({
    //   restaurant_id,
    //   code,
    //   name: name.trim(),
    //   phone,
    //   used: false,
    //   expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    // });

    const message = `¡Hola ${name.trim()}! Te han invitado a usar mipropina. Tu código de invitación es: ${code}. Regístrate en https://mipropina.es/auth/registro`;

    const whatsapp_link = getWhatsAppLink(phone, message);

    return NextResponse.json({
      code,
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
