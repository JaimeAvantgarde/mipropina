import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hashStaffPassword, validatePasswordStrength } from "@/lib/passwords";
import { createSessionForStaff } from "@/lib/session";

export async function POST(request: Request) {
  let body: { token?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const token = (body.token ?? "").trim();
  const password = body.password ?? "";

  if (!token) {
    return NextResponse.json({ error: "Token requerido." }, { status: 400 });
  }
  const strength = validatePasswordStrength(password);
  if (!strength.ok) {
    return NextResponse.json({ error: strength.reason }, { status: 400 });
  }

  const { data: staff } = await supabaseAdmin
    .from("staff")
    .select("id, password_reset_expires_at, status")
    .eq("password_reset_token", token)
    .maybeSingle();

  if (!staff || staff.status === "inactive") {
    return NextResponse.json(
      { error: "Enlace no válido." },
      { status: 404 }
    );
  }
  if (
    !staff.password_reset_expires_at ||
    new Date(staff.password_reset_expires_at) < new Date()
  ) {
    return NextResponse.json(
      { error: "El enlace ha caducado. Pide otro." },
      { status: 410 }
    );
  }

  await supabaseAdmin
    .from("staff")
    .update({
      password_hash: hashStaffPassword(password),
      password_reset_token: null,
      password_reset_expires_at: null,
    })
    .eq("id", staff.id);

  // Log the user in straight away.
  try {
    await createSessionForStaff(staff.id as string);
  } catch (err) {
    console.error("[auth/reset-password] session", err);
  }

  return NextResponse.json({ ok: true, redirect: "/dashboard" });
}
