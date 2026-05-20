// Edge-safe HMAC-signed token utilities. Uses only Web Crypto so the
// Next.js middleware (Edge runtime) can verify tokens without importing Node
// built-ins. Node API routes import this same module — Web Crypto is also
// available globally in modern Node.

export type TokenKind = "admin" | "staff";

export type TokenPayload = {
  kind: TokenKind;
  sub: string;
  iat: number;
  exp: number;
};

function bytesToBase64url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64urlToBytes(str: string): Uint8Array {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function base64urlToString(str: string): string {
  return new TextDecoder().decode(base64urlToBytes(str));
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return bytesToBase64url(new Uint8Array(sig));
}

function constantTimeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createToken(
  kind: TokenKind,
  sub: string,
  ttlSeconds: number,
  secret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = { kind, sub, iat: now, exp: now + ttlSeconds };
  const data = bytesToBase64url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmacSign(data, secret);
  return `${data}.${sig}`;
}

export async function verifyToken(
  token: string | undefined,
  expectedKind: TokenKind,
  secret: string
): Promise<TokenPayload | null> {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [data, sig] = parts;
  const expected = await hmacSign(data, secret);
  if (!constantTimeEqualString(sig, expected)) return null;

  let payload: TokenPayload;
  try {
    payload = JSON.parse(base64urlToString(data)) as TokenPayload;
  } catch {
    return null;
  }

  if (payload.kind !== expectedKind) return null;
  if (typeof payload.exp !== "number") return null;
  if (Math.floor(Date.now() / 1000) >= payload.exp) return null;

  return payload;
}

// ---------------------------------------------------------------------------
// Cookie names + lifetimes (shared between middleware and API routes)
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
