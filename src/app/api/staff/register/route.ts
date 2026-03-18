import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, name, email, phone, iban } = body;

    if (!token || !name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Token, nombre y email son obligatorios." },
        { status: 400 }
      );
    }

    // Validate invite token
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from("invite_code")
      .select("*, restaurant:restaurant(id, name, slug)")
      .eq("code", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: "Invitación no válida o expirada." },
        { status: 400 }
      );
    }

    // Create auth user via admin API
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      email_confirm: true,
    });

    let resolvedUser = authUser?.user ?? null;

    if (authError) {
      // If user already exists, try to get them
      if (authError.message?.includes("already been registered") || authError.status === 422) {
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users.find((u) => u.email === email.trim());
        if (!existingUser) {
          return NextResponse.json(
            { error: "Error al crear la cuenta. El email puede estar en uso." },
            { status: 400 }
          );
        }
        // Use existing user
        resolvedUser = existingUser;
      } else {
        console.error("[staff/register] Auth error:", authError);
        return NextResponse.json(
          { error: "Error al crear la cuenta." },
          { status: 500 }
        );
      }
    }

    const restaurant = invite.restaurant as unknown as { id: string; name: string; slug: string };

    // Create staff record
    const { error: staffError } = await supabaseAdmin
      .from("staff")
      .insert({
        restaurant_id: restaurant.id,
        auth_user_id: resolvedUser!.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        iban: iban?.trim() || null,
        role: "waiter",
        avatar_emoji: "🧑‍🍳",
      });

    if (staffError) {
      console.error("[staff/register] Staff insert error:", staffError);
      return NextResponse.json(
        { error: "Error al crear el perfil. Es posible que ya estés registrado en este restaurante." },
        { status: 500 }
      );
    }

    // Mark invite as used
    await supabaseAdmin
      .from("invite_code")
      .update({ used: true })
      .eq("id", invite.id);

    return NextResponse.json({
      success: true,
      restaurant_name: restaurant.name,
    });
  } catch (error) {
    console.error("[staff/register] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
