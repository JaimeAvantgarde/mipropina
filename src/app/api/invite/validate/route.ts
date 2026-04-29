import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = checkRateLimit(`invite-validate:${ip}`, 60, 60_000);
    if (!allowed) {
      return NextResponse.json({ valid: false }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token es obligatorio." },
        { status: 400 }
      );
    }

    const { data: invite, error } = await supabaseAdmin
      .from("invite_code")
      .select("id, name, used, expires_at, restaurant:restaurant(id, name)")
      .eq("code", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error || !invite) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({
      valid: true,
      invite_name: invite.name,
      restaurant_name: (invite.restaurant as unknown as { id: string; name: string }).name,
    });
  } catch (error) {
    console.error("[invite/validate] Error:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
