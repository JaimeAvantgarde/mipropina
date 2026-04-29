import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data, error } = await supabaseAdmin
    .from("restaurant")
    .select("id, name, slug, logo_emoji, logo_url, theme_color, tip_amounts, custom_amount_enabled, thank_you_message, google_maps_url, stripe_charges_enabled")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: "Restaurante no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
