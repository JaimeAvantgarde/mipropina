import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSessionForStaff } from "@/lib/session";
import { hashStaffPassword, validatePasswordStrength } from "@/lib/passwords";
import { sendVerificationEmail } from "@/lib/email";

const AVATAR_BY_ROLE: Record<string, string> = {
  manager: "👤",
  waiter: "🧑‍🍳",
  kitchen: "👨‍🍳",
};

const VERIFICATION_TTL_HOURS = 24;

export async function POST(request: Request) {
  let body: { token?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const token = (body.token ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!token) {
    return NextResponse.json({ error: "Token requerido." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }
  const strength = validatePasswordStrength(password);
  if (!strength.ok) {
    return NextResponse.json({ error: strength.reason }, { status: 400 });
  }

  const { data: invite } = await supabaseAdmin
    .from("invite_code")
    .select("id, token, name, phone, role, used, expires_at, restaurant_id")
    .eq("token", token)
    .maybeSingle();

  if (!invite) {
    return NextResponse.json({ error: "Invitación no encontrada." }, { status: 404 });
  }
  if (invite.used) {
    return NextResponse.json({ error: "Esta invitación ya fue usada." }, { status: 409 });
  }
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "Esta invitación ha caducado." }, { status: 410 });
  }

  // Phone must still be free.
  const { data: phoneClash } = await supabaseAdmin
    .from("staff")
    .select("id")
    .eq("phone", invite.phone)
    .neq("status", "inactive")
    .maybeSingle();

  if (phoneClash) {
    return NextResponse.json(
      { error: "Ese teléfono ya pertenece a otro miembro activo." },
      { status: 409 }
    );
  }

  // Email must be free (case-insensitive)
  const { data: emailClash } = await supabaseAdmin
    .from("staff")
    .select("id")
    .ilike("email", email)
    .neq("status", "inactive")
    .maybeSingle();

  if (emailClash) {
    return NextResponse.json(
      { error: "Ese email ya está registrado en otra cuenta." },
      { status: 409 }
    );
  }

  const passwordHash = hashStaffPassword(password);
  const verificationToken = randomBytes(24).toString("base64url");
  const verificationExpires = new Date(
    Date.now() + VERIFICATION_TTL_HOURS * 60 * 60 * 1000
  ).toISOString();

  // 1. Create the staff row
  const { data: staff, error: insertErr } = await supabaseAdmin
    .from("staff")
    .insert({
      restaurant_id: invite.restaurant_id,
      name: invite.name,
      phone: invite.phone,
      email,
      password_hash: passwordHash,
      verification_token: verificationToken,
      verification_expires_at: verificationExpires,
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
      { error: "No se pudo crear tu cuenta." },
      { status: 500 }
    );
  }

  // 2. Mark invite as used
  await supabaseAdmin
    .from("invite_code")
    .update({ used: true })
    .eq("id", invite.id);

  // 3. Link manager to restaurant
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

  // 5. Fire-and-forget verification email
  sendVerificationEmail(email, invite.name as string, verificationToken).catch(
    (e) => console.error("[invite/accept] verification email failed:", e)
  );

  return NextResponse.json({ ok: true, redirect: "/dashboard" });
}
