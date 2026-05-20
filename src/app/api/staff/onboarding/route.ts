import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireManager } from "@/lib/session";

export async function POST(request: Request) {
  const { session, error: authError } = await requireManager();
  if (authError) return authError;

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Email inválido." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("staff")
    .update({ email })
    .eq("id", session.staffId);

  if (error) {
    console.error("[staff/onboarding]", error);
    return NextResponse.json(
      { error: "No se pudo guardar el email." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
