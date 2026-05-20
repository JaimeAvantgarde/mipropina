import { createHmac, timingSafeEqual, randomBytes, scryptSync } from "node:crypto";

// ---------------------------------------------------------------------------
// Signed cookie tokens (stateless, HMAC-SHA256)
//
// Format: base64url(payloadJson) + "." + base64url(hmacSig)
// The payload carries kind, sub (subject id), iat, exp.
// ---------------------------------------------------------------------------

export type TokenKind = "admin" | "staff";

export type TokenPayload = {
  kind: TokenKind;
  sub: string;
  iat: number;
  exp: number;
};

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64urlDecode(str: string): Buffer {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function sign(data: string, secret: string): string {
  return base64url(createHmac("sha256", secret).update(data).digest());
}

export function createToken(
  kind: TokenKind,
  sub: string,
  ttlSeconds: number,
  secret: string
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = { kind, sub, iat: now, exp: now + ttlSeconds };
  const data = base64url(Buffer.from(JSON.stringify(payload)));
  const sig = sign(data, secret);
  return `${data}.${sig}`;
}

export function verifyToken(
  token: string | undefined,
  expectedKind: TokenKind,
  secret: string
): TokenPayload | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [data, sig] = parts;
  const expected = sign(data, secret);

  // Constant-time compare on equal-length buffers
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: TokenPayload;
  try {
    payload = JSON.parse(base64urlDecode(data).toString("utf8")) as TokenPayload;
  } catch {
    return null;
  }

  if (payload.kind !== expectedKind) return null;
  if (typeof payload.exp !== "number") return null;
  if (Math.floor(Date.now() / 1000) >= payload.exp) return null;

  return payload;
}

// ---------------------------------------------------------------------------
// Password hashing (scrypt, used for the Mario admin password env var)
// Format: scrypt$<saltBase64>$<derivedKeyBase64>
// ---------------------------------------------------------------------------

const SCRYPT_KEY_LEN = 32;

export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(plain, salt, SCRYPT_KEY_LEN);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const salt = Buffer.from(parts[1], "base64");
  const expected = Buffer.from(parts[2], "base64");

  let derived: Buffer;
  try {
    derived = scryptSync(plain, salt, SCRYPT_KEY_LEN);
  } catch {
    return false;
  }

  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

// ---------------------------------------------------------------------------
// Cookie names + lifetimes
// ---------------------------------------------------------------------------

export const ADMIN_COOKIE = "mipropina_admin";
export const STAFF_COOKIE = "mipropina_session";

export const ADMIN_TTL_SECONDS = 60 * 60 * 12;          // 12h
export const STAFF_TTL_SECONDS = 60 * 60 * 24 * 30;     // 30 days

export function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
