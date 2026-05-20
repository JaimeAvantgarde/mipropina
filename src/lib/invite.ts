import { randomBytes } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { StaffRole } from "@/lib/session";

const INVITE_TTL_DAYS = 7;

export type CreatedInvite = {
  id: string;
  token: string;
  url: string;
  whatsappUrl: string;
  expiresAt: string;
};

function appBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || "https://mipropina.es";
  return url.replace(/\/+$/, "");
}

// E.164 normalization for wa.me (digits only, leading + optional).
// Accepts "+34 635 41 50 49", "0034635...", "635415049" (assumed ES) etc.
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.replace(/[\s\-()]/g, "");
  if (!trimmed) return null;

  let digits: string;
  if (trimmed.startsWith("+")) {
    digits = trimmed.slice(1).replace(/\D/g, "");
  } else if (trimmed.startsWith("00")) {
    digits = trimmed.slice(2).replace(/\D/g, "");
  } else {
    const local = trimmed.replace(/\D/g, "");
    if (!local) return null;
    digits = "34" + local;
  }

  if (digits.length < 8 || digits.length > 15) return null;
  return "+" + digits;
}

function phoneForWaMe(e164: string): string {
  return e164.replace(/\D/g, "");
}

function generateToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function createInvite(args: {
  restaurantId: string;
  role: StaffRole;
  name: string;
  phone: string;
  restaurantName: string;
}): Promise<CreatedInvite> {
  const phone = normalizePhone(args.phone);
  if (!phone) throw new Error("Teléfono inválido.");

  const token = generateToken();
  const expiresAt = new Date(
    Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabaseAdmin
    .from("invite_code")
    .insert({
      restaurant_id: args.restaurantId,
      token,
      phone,
      name: args.name.trim(),
      role: args.role,
      used: false,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "No se pudo crear la invitación.");
  }

  const url = `${appBaseUrl()}/i/${token}`;
  const message =
    args.role === "manager"
      ? `Hola ${args.name}, te invito a gestionar ${args.restaurantName} en mipropina. Abre este enlace para entrar:\n${url}`
      : `Hola ${args.name}, ${args.restaurantName} te invita a recibir propinas digitales con mipropina. Abre este enlace para entrar:\n${url}`;

  const whatsappUrl = `https://wa.me/${phoneForWaMe(phone)}?text=${encodeURIComponent(message)}`;

  return {
    id: data.id as string,
    token,
    url,
    whatsappUrl,
    expiresAt,
  };
}

export async function findActiveInvite(args: {
  restaurantId: string;
  role: StaffRole;
}) {
  const { data } = await supabaseAdmin
    .from("invite_code")
    .select("id, token, phone, name, role, used, expires_at, created_at")
    .eq("restaurant_id", args.restaurantId)
    .eq("role", args.role)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}
