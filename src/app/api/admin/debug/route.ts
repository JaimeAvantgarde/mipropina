import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return NextResponse.json({
    user_email: user?.email || "NO USER",
    superadmin_email: process.env.SUPERADMIN_EMAIL || "NOT SET",
    match: user?.email?.toLowerCase() === process.env.SUPERADMIN_EMAIL?.toLowerCase(),
  });
}
