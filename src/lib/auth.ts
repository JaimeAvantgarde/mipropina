import { NextResponse } from "next/server";
import { requireStaff, requireManager, type StaffRole, type StaffSession } from "@/lib/session";
import { requireAdmin } from "@/lib/admin-auth";

// ---------------------------------------------------------------------------
// Thin compatibility shims for the rest of the codebase.
// All real logic lives in lib/session.ts (staff) and lib/admin-auth.ts (Mario).
// ---------------------------------------------------------------------------

export type AuthResult = {
  userId: string;       // same as staffId now (no Supabase Auth row)
  staffId: string;
  restaurantId: string;
  role: StaffRole;
};

function toAuthResult(session: StaffSession): AuthResult {
  return {
    userId: session.staffId,
    staffId: session.staffId,
    restaurantId: session.restaurantId,
    role: session.role,
  };
}

export async function requireAuth(): Promise<
  { auth: AuthResult; error: null } | { auth: null; error: NextResponse }
> {
  const result = await requireStaff();
  if (result.error) return { auth: null, error: result.error };
  return { auth: toAuthResult(result.session), error: null };
}

export async function requireOwner(restaurantId?: string): Promise<
  { auth: AuthResult; error: null } | { auth: null; error: NextResponse }
> {
  const result = await requireManager(restaurantId);
  if (result.error) return { auth: null, error: result.error };
  return { auth: toAuthResult(result.session), error: null };
}

export async function requireSuperadmin(): Promise<
  { email: string; error: null } | { email: null; error: NextResponse }
> {
  const result = await requireAdmin();
  if (result.error) return { email: null, error: result.error };
  return { email: result.admin.user, error: null };
}
