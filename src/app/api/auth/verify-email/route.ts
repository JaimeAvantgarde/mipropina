import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

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

  const { data: staff } = await supabaseAdmin
    .from("staff")
    .select("id, verification_expires_at, email_verified_at")
    .eq("verification_token", token)
    .maybeSingle();

  if (!staff) {
    return NextResponse.json(
      { error: "Enlace de verificación no válido." },
      { status: 404 }
    );
  }

  if (staff.email_verified_at) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  if (
    !staff.verification_expires_at ||
    new Date(staff.verification_expires_at) < new Date()
  ) {
    return NextResponse.json(
      { error: "El enlace de verificación ha caducado. Pide uno nuevo." },
      { status: 410 }
    );
  }

  await supabaseAdmin
    .from("staff")
    .update({
      email_verified_at: new Date().toISOString(),
      verification_token: null,
      verification_expires_at: null,
    })
    .eq("id", staff.id);

  return NextResponse.json({ ok: true });
}
