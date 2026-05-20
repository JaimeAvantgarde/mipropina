import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/session";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const VERIFICATION_TTL_HOURS = 24;

export async function POST(request: Request) {
  const { session, error: authError } = await requireStaff();
  if (authError) return authError;

  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`verify-resend:${session.staffId}:${ip}`, 3, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Espera un minuto antes de pedir otro email." },
      { status: 429 }
    );
  }

  const { data: staff } = await supabaseAdmin
    .from("staff")
    .select("id, name, email, email_verified_at")
    .eq("id", session.staffId)
    .maybeSingle();

  if (!staff) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  if (staff.email_verified_at) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const token = randomBytes(24).toString("base64url");
  const expires = new Date(Date.now() + VERIFICATION_TTL_HOURS * 60 * 60 * 1000).toISOString();

  await supabaseAdmin
    .from("staff")
    .update({
      verification_token: token,
      verification_expires_at: expires,
    })
    .eq("id", staff.id);

  sendVerificationEmail(staff.email as string, staff.name as string, token).catch(
    (e) => console.error("[auth/resend-verification] failed:", e)
  );

  return NextResponse.json({ ok: true });
}
