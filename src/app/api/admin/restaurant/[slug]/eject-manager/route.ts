import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { slug } = await params;

  const { data: restaurant } = await supabaseAdmin
    .from("restaurant")
    .select("id, manager_id")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (!restaurant) {
    return NextResponse.json(
      { error: "Restaurante no encontrado." },
      { status: 404 }
    );
  }

  if (!restaurant.manager_id) {
    return NextResponse.json(
      { error: "Este restaurante no tiene gerente." },
      { status: 409 }
    );
  }

  // 1. Mark the manager inactive
  await supabaseAdmin
    .from("staff")
    .update({ status: "inactive", active: false })
    .eq("id", restaurant.manager_id);

  // 2. Move the rest of the team to pending (waiters & kitchen)
  await supabaseAdmin
    .from("staff")
    .update({ status: "pending" })
    .eq("restaurant_id", restaurant.id)
    .neq("id", restaurant.manager_id)
    .eq("status", "active");

  // 3. Detach manager from the restaurant
  await supabaseAdmin
    .from("restaurant")
    .update({ manager_id: null })
    .eq("id", restaurant.id);

  // 4. Invalidate any pending invite for that restaurant's manager role
  await supabaseAdmin
    .from("invite_code")
    .update({ used: true })
    .eq("restaurant_id", restaurant.id)
    .eq("role", "manager")
    .eq("used", false);

  return NextResponse.json({ ok: true });
}
