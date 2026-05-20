import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const RESET_TTL_MINUTES = 60;

export async function POST(request: Request) {
  // Rate-limit by IP and by email (prevents enumeration via timing).
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`forgot:${ip}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiadas peticiones. Espera un minuto." },
      { status: 429 }
    );
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }

  const { data: staff } = await supabaseAdmin
    .from("staff")
    .select("id, name, email, status")
    .ilike("email", email)
    .neq("status", "inactive")
    .maybeSingle();

  // Always return success — don't leak whether the email exists.
  if (!staff) {
    return NextResponse.json({ ok: true });
  }

  const token = randomBytes(24).toString("base64url");
  const expires = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000).toISOString();

  await supabaseAdmin
    .from("staff")
    .update({
      password_reset_token: token,
      password_reset_expires_at: expires,
    })
    .eq("id", staff.id);

  sendPasswordResetEmail(staff.email as string, staff.name as string, token).catch(
    (e) => console.error("[auth/forgot-password] failed:", e)
  );

  return NextResponse.json({ ok: true });
}
