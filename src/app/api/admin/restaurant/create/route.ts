import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  let body: {
    name?: string;
    slug?: string;
    logo_emoji?: string;
    theme_color?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const slugRaw = (body.slug ?? "").trim().toLowerCase();

  if (!name || !slugRaw) {
    return NextResponse.json(
      { error: "Nombre y URL son obligatorios." },
      { status: 400 }
    );
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugRaw)) {
    return NextResponse.json(
      { error: "La URL solo puede contener minúsculas, números y guiones." },
      { status: 400 }
    );
  }

  const { data: existing } = await supabaseAdmin
    .from("restaurant")
    .select("id")
    .eq("slug", slugRaw)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Esa URL ya está en uso." },
      { status: 409 }
    );
  }

  const { data: restaurant, error: insertErr } = await supabaseAdmin
    .from("restaurant")
    .insert({
      name,
      slug: slugRaw,
      logo_emoji: body.logo_emoji?.trim() || "🍽️",
      theme_color: body.theme_color?.trim() || "#2ECC87",
    })
    .select()
    .single();

  if (insertErr || !restaurant) {
    console.error("[admin/restaurant/create]", insertErr);
    return NextResponse.json(
      { error: "No se pudo crear el restaurante." },
      { status: 500 }
    );
  }

  // Seed default QR for table 1
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://mipropina.es").replace(/\/+$/, "");
  await supabaseAdmin.from("qr_code").insert({
    restaurant_id: restaurant.id,
    table_label: "Mesa 1",
    url: `${appUrl}/t/${slugRaw}?mesa=1`,
  });

  return NextResponse.json({ restaurant });
}
