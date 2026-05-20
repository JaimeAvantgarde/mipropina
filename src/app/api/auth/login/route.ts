import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyStaffPassword } from "@/lib/passwords";
import { createSessionForStaff } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Throttle brute-force attempts per IP.
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`login:${ip}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un minuto." },
      { status: 429 }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email y contraseña son obligatorios." },
      { status: 400 }
    );
  }

  const { data: staff } = await supabaseAdmin
    .from("staff")
    .select("id, password_hash, status")
    .ilike("email", email)
    .maybeSingle();

  if (!staff || staff.status === "inactive") {
    // Don't leak whether the email exists.
    return NextResponse.json(
      { error: "Email o contraseña incorrectos." },
      { status: 401 }
    );
  }

  if (!verifyStaffPassword(password, staff.password_hash)) {
    return NextResponse.json(
      { error: "Email o contraseña incorrectos." },
      { status: 401 }
    );
  }

  try {
    await createSessionForStaff(staff.id as string);
  } catch (err) {
    console.error("[auth/login] session", err);
    return NextResponse.json(
      { error: "No se pudo iniciar la sesión." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, redirect: "/dashboard" });
}
