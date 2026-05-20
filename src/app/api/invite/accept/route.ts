import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSessionForStaff } from "@/lib/session";

const AVATAR_BY_ROLE: Record<string, string> = {
  manager: "👤",
  waiter: "🧑‍🍳",
  kitchen: "👨‍🍳",
};

export async function POST(request: Request) {
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const token = (body.token ?? "").trim();
  if (!token) {
    return NextResponse.json({ error: "Token requerido." }, { status: 400 });
  }

  const { data: invite } = await supabaseAdmin
    .from("invite_code")
    .select(
      "id, token, name, phone, role, used, expires_at, restaurant_id"
    )
    .eq("token", token)
    .maybeSingle();

  if (!invite) {
    return NextResponse.json(
      { error: "Invitación no encontrada." },
      { status: 404 }
    );
  }

  if (invite.used) {
    return NextResponse.json(
      { error: "Esta invitación ya fue usada." },
      { status: 409 }
    );
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "Esta invitación ha caducado." },
      { status: 410 }
    );
  }

  // Phone must still be free.
  const { data: clash } = await supabaseAdmin
    .from("staff")
    .select("id, status")
    .eq("phone", invite.phone)
    .neq("status", "inactive")
    .maybeSingle();

  if (clash) {
    return NextResponse.json(
      { error: "Ese teléfono ya pertenece a otro miembro activo." },
      { status: 409 }
    );
  }

  // 1. Create the staff row
  const { data: staff, error: insertErr } = await supabaseAdmin
    .from("staff")
    .insert({
      restaurant_id: invite.restaurant_id,
      name: invite.name,
      phone: invite.phone,
      role: invite.role,
      avatar_emoji: AVATAR_BY_ROLE[invite.role] ?? "🧑‍🍳",
      status: "active",
      active: true,
    })
    .select("id")
    .single();

  if (insertErr || !staff) {
    console.error("[invite/accept] staff insert", insertErr);
    return NextResponse.json(
      { error: "No se pudo crear tu perfil." },
      { status: 500 }
    );
  }

  // 2. Mark invite as used
  await supabaseAdmin
    .from("invite_code")
    .update({ used: true })
    .eq("id", invite.id);

  // 3. If this is a manager invite, link the restaurant
  if (invite.role === "manager") {
    await supabaseAdmin
      .from("restaurant")
      .update({ manager_id: staff.id })
      .eq("id", invite.restaurant_id);
  }

  // 4. Create session cookie
  try {
    await createSessionForStaff(staff.id as string);
  } catch (err) {
    console.error("[invite/accept] session", err);
    return NextResponse.json(
      { error: "No se pudo iniciar la sesión." },
      { status: 500 }
    );
  }

  // 5. Managers go through onboarding (collect email for Stripe); rest goes straight to dashboard.
  const redirect = invite.role === "manager" ? "/onboarding" : "/dashboard";

  return NextResponse.json({ ok: true, redirect });
}
