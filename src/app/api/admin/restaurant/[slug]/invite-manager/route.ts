import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { createInvite, normalizePhone } from "@/lib/invite";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { slug } = await params;

  let body: { name?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const phone = normalizePhone(body.phone ?? "");

  if (!name || !phone) {
    return NextResponse.json(
      { error: "Nombre y teléfono son obligatorios." },
      { status: 400 }
    );
  }

  const { data: restaurant } = await supabaseAdmin
    .from("restaurant")
    .select("id, name, manager_id")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (!restaurant) {
    return NextResponse.json(
      { error: "Restaurante no encontrado." },
      { status: 404 }
    );
  }

  if (restaurant.manager_id) {
    return NextResponse.json(
      {
        error:
          "Este restaurante ya tiene gerente. Expúlsalo primero si quieres invitar a otro.",
      },
      { status: 409 }
    );
  }

  // Reject if the phone is already in use by an active staff in any restaurant.
  const { data: clash } = await supabaseAdmin
    .from("staff")
    .select("id")
    .eq("phone", phone)
    .neq("status", "inactive")
    .maybeSingle();

  if (clash) {
    return NextResponse.json(
      { error: "Ese teléfono ya pertenece a otro miembro activo." },
      { status: 409 }
    );
  }

  try {
    const invite = await createInvite({
      restaurantId: restaurant.id as string,
      role: "manager",
      name,
      phone,
      restaurantName: restaurant.name as string,
    });
    return NextResponse.json({ invite });
  } catch (err) {
    console.error("[admin/invite-manager]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al invitar." },
      { status: 500 }
    );
  }
}
