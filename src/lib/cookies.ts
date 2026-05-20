import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Node-only password hashing (scrypt). The Edge middleware does NOT import
// this file; token verification lives in lib/tokens.ts (Web Crypto).
// Format: scrypt$<saltBase64>$<derivedKeyBase64>

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

// Re-export the Edge-safe token & cookie helpers so existing imports keep
// working. Importers that only need tokens should use lib/tokens directly.
export {
  ADMIN_COOKIE,
  STAFF_COOKIE,
  ADMIN_TTL_SECONDS,
  STAFF_TTL_SECONDS,
  cookieOptions,
  createToken,
  verifyToken,
  type TokenKind,
  type TokenPayload,
} from "./tokens";
