import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// scrypt-based password hashing for staff (gerente / camarero / cocina).
// Format: scrypt$<saltBase64>$<derivedKeyBase64> — same shape used for Mario's
// admin password in lib/cookies.ts so anyone reading the DB can recognise it.

const SCRYPT_KEY_LEN = 32;

export function hashStaffPassword(plain: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(plain, salt, SCRYPT_KEY_LEN);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export function verifyStaffPassword(plain: string, stored: string | null): boolean {
  if (!stored) return false;
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

// Minimum policy: 8+ chars, at least one letter and one number.
export function validatePasswordStrength(plain: string): { ok: true } | { ok: false; reason: string } {
  if (plain.length < 8) return { ok: false, reason: "La contraseña debe tener al menos 8 caracteres." };
  if (!/[A-Za-z]/.test(plain)) return { ok: false, reason: "La contraseña debe incluir al menos una letra." };
  if (!/\d/.test(plain)) return { ok: false, reason: "La contraseña debe incluir al menos un número." };
  return { ok: true };
}
