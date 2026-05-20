import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  STAFF_COOKIE,
  STAFF_TTL_SECONDS,
  cookieOptions,
  createToken,
  verifyToken,
} from "@/lib/cookies";

// ---------------------------------------------------------------------------
// Staff session (manager, waiter, kitchen) — no Supabase Auth involved.
// The cookie is an HMAC-signed token; the staff row is the source of truth.
// status='inactive' invalidates the session at the next request even if the
// cookie is still cryptographically valid.
// ---------------------------------------------------------------------------

function getSecret(): string | null {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

export type StaffRole = "manager" | "waiter" | "kitchen";
export type StaffStatus = "active" | "pending" | "inactive";

export type StaffSession = {
  staffId: string;
  restaurantId: string;
  role: StaffRole;
  status: StaffStatus;
};

export async function createSessionForStaff(staffId: string): Promise<void> {
  const secret = getSecret();
  if (!secret) throw new Error("SESSION_SECRET no configurado.");

  const token = await createToken("staff", staffId, STAFF_TTL_SECONDS, secret);
  const jar = await cookies();
  jar.set(STAFF_COOKIE, token, cookieOptions(STAFF_TTL_SECONDS));
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.set(STAFF_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
}

export async function getStaffSession(): Promise<StaffSession | null> {
  const secret = getSecret();
  if (!secret) return null;

  const jar = await cookies();
  const token = jar.get(STAFF_COOKIE)?.value;
  const payload = await verifyToken(token, "staff", secret);
  if (!payload) return null;

  const { data } = await supabaseAdmin
    .from("staff")
    .select("id, restaurant_id, role, status")
    .eq("id", payload.sub)
    .maybeSingle();

  if (!data) return null;
  if (data.status !== "active") return null;

  return {
    staffId: data.id as string,
    restaurantId: data.restaurant_id as string,
    role: data.role as StaffRole,
    status: data.status as StaffStatus,
  };
}

export async function requireStaff(): Promise<
  { session: StaffSession; error: null } | { session: null; error: NextResponse }
> {
  const session = await getStaffSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "No autenticado." }, { status: 401 }),
    };
  }
  return { session, error: null };
}

export async function requireManager(restaurantId?: string): Promise<
  { session: StaffSession; error: null } | { session: null; error: NextResponse }
> {
  const result = await requireStaff();
  if (result.error) return result;

  if (result.session.role !== "manager") {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Solo el gerente puede realizar esta acción." },
        { status: 403 }
      ),
    };
  }

  if (restaurantId && result.session.restaurantId !== restaurantId) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "No tienes acceso a este restaurante." },
        { status: 403 }
      ),
    };
  }

  return result;
}
