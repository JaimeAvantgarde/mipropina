import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_TTL_SECONDS,
  cookieOptions,
  createToken,
  verifyToken,
  verifyPassword,
} from "@/lib/cookies";

// ---------------------------------------------------------------------------
// Mario admin auth
// Credentials live entirely in env vars (no row in any users table):
//   - ADMIN_USER          : login username
//   - ADMIN_PASSWORD_HASH : scrypt$salt$hash (use bin/hash-admin-password.ts)
//   - ADMIN_COOKIE_SECRET : HMAC secret for the signed admin cookie
// ---------------------------------------------------------------------------

function getSecret(): string | null {
  const s = process.env.ADMIN_COOKIE_SECRET;
  return s && s.length >= 32 ? s : null;
}

export type AdminLoginResult =
  | { ok: true; token: string }
  | { ok: false; reason: "missing_config" | "bad_credentials" };

export async function checkAdminLogin(
  user: string,
  password: string
): Promise<AdminLoginResult> {
  const expectedUser = process.env.ADMIN_USER;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  const secret = getSecret();

  if (!expectedUser || !expectedHash || !secret) {
    return { ok: false, reason: "missing_config" };
  }

  if (user !== expectedUser || !verifyPassword(password, expectedHash)) {
    return { ok: false, reason: "bad_credentials" };
  }

  const token = await createToken("admin", expectedUser, ADMIN_TTL_SECONDS, secret);
  return { ok: true, token };
}

export async function setAdminCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, cookieOptions(ADMIN_TTL_SECONDS));
}

export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
}

export async function getAdminSession(): Promise<{ user: string } | null> {
  const secret = getSecret();
  if (!secret) return null;

  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  const payload = await verifyToken(token, "admin", secret);
  if (!payload) return null;

  return { user: payload.sub };
}

export async function requireAdmin(): Promise<
  { admin: { user: string }; error: null } | { admin: null; error: NextResponse }
> {
  const admin = await getAdminSession();
  if (!admin) {
    return {
      admin: null,
      error: NextResponse.json({ error: "Acceso denegado." }, { status: 403 }),
    };
  }
  return { admin, error: null };
}
