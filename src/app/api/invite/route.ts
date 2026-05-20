import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireOwner } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createInvite, normalizePhone } from "@/lib/invite";

// Manager-invokes-this endpoint to invite waiters and kitchen staff.
// The platform admin (Mario) has its own endpoint for inviting managers.

const ALLOWED_ROLES = new Set(["waiter", "kitchen"]);

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = checkRateLimit(`invite:${ip}`, 20, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Demasiadas invitaciones. Espera un momento." },
        { status: 429 }
      );
    }

    let body: {
      restaurant_id?: string;
      name?: string;
      phone?: string;
      role?: string;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
    }

    const restaurantId = (body.restaurant_id ?? "").trim();
    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurant_id es obligatorio." },
        { status: 400 }
      );
    }

    const { error: authError } = await requireOwner(restaurantId);
    if (authError) return authError;

    const name = (body.name ?? "").trim();
    if (name.length < 2) {
      return NextResponse.json(
        { error: "El nombre es obligatorio (mínimo 2 caracteres)." },
        { status: 400 }
      );
    }

    const phone = normalizePhone(body.phone ?? "");
    if (!phone) {
      return NextResponse.json(
        { error: "Teléfono inválido." },
        { status: 400 }
      );
    }

    const role = (body.role ?? "waiter").trim();
    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json(
        { error: "Rol inválido." },
        { status: 400 }
      );
    }

    // Phone must be free
    const { data: clash } = await supabaseAdmin
      .from("staff")
      .select("id")
      .eq("phone", phone)
      .neq("status", "inactive")
      .maybeSingle();

    if (clash) {
      return NextResponse.json(
        { error: "Ese teléfono ya pertenece a otro miembro activo." },
        { status: 409 }
      );
    }

    const { data: restaurant } = await supabaseAdmin
      .from("restaurant")
      .select("id, name")
      .eq("id", restaurantId)
      .maybeSingle();

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurante no encontrado." },
        { status: 404 }
      );
    }

    const invite = await createInvite({
      restaurantId,
      role: role as "waiter" | "kitchen",
      name,
      phone,
      restaurantName: restaurant.name as string,
    });

    return NextResponse.json({
      invite_link: invite.url,
      whatsapp_link: invite.whatsappUrl,
    });
  } catch (error) {
    console.error("[invite] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al generar la invitación." },
      { status: 500 }
    );
  }
}
