import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type AuthResult = {
  userId: string;
  staffId: string;
  restaurantId: string;
  role: "owner" | "waiter";
};

/**
 * Verifies that the request comes from an authenticated user
 * and returns their staff info (id, restaurant_id, role).
 * Returns null and a NextResponse error if unauthorized.
 */
export async function requireAuth(): Promise<
  { auth: AuthResult; error: null } | { auth: null; error: NextResponse }
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        auth: null,
        error: NextResponse.json(
          { error: "No autenticado." },
          { status: 401 }
        ),
      };
    }

    const { data: staffRecord } = await supabaseAdmin
      .from("staff")
      .select("id, restaurant_id, role")
      .eq("auth_user_id", user.id)
      .single();

    if (!staffRecord) {
      return {
        auth: null,
        error: NextResponse.json(
          { error: "No se encontró tu perfil." },
          { status: 403 }
        ),
      };
    }

    return {
      auth: {
        userId: user.id,
        staffId: staffRecord.id,
        restaurantId: staffRecord.restaurant_id,
        role: staffRecord.role as "owner" | "waiter",
      },
      error: null,
    };
  } catch {
    return {
      auth: null,
      error: NextResponse.json(
        { error: "Error de autenticación." },
        { status: 401 }
      ),
    };
  }
}

/**
 * Requires the user to be an owner of the given restaurant.
 */
export async function requireOwner(restaurantId?: string): Promise<
  { auth: AuthResult; error: null } | { auth: null; error: NextResponse }
> {
  const result = await requireAuth();
  if (result.error) return result;

  if (result.auth.role !== "owner") {
    return {
      auth: null,
      error: NextResponse.json(
        { error: "Solo el gerente puede realizar esta acción." },
        { status: 403 }
      ),
    };
  }

  if (restaurantId && result.auth.restaurantId !== restaurantId) {
    return {
      auth: null,
      error: NextResponse.json(
        { error: "No tienes acceso a este restaurante." },
        { status: 403 }
      ),
    };
  }

  return result;
}
