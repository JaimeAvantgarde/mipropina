import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import AcceptInviteClient from "./accept-client";

const ROLE_LABEL: Record<string, string> = {
  manager: "gerente",
  waiter: "camarero",
  kitchen: "cocinero/a",
};

export const dynamic = "force-dynamic";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const { data: invite } = await supabaseAdmin
    .from("invite_code")
    .select(
      "id, token, name, phone, role, used, expires_at, restaurant_id"
    )
    .eq("token", token)
    .maybeSingle();

  if (!invite) {
    notFound();
  }

  const { data: restaurant } = await supabaseAdmin
    .from("restaurant")
    .select("id, name, logo_emoji, slug")
    .eq("id", invite.restaurant_id)
    .maybeSingle();

  const isExpired = new Date(invite.expires_at) < new Date();
  const isUsed = !!invite.used;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-5xl mb-4">{restaurant?.logo_emoji ?? "👋"}</div>

        {isUsed ? (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Invitación ya usada
            </h1>
            <p className="text-gray-600 text-sm">
              Esta invitación ya fue aceptada. Si necesitas otro enlace, pide
              uno nuevo a quien te invitó.
            </p>
          </>
        ) : isExpired ? (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Invitación caducada
            </h1>
            <p className="text-gray-600 text-sm">
              El enlace ha caducado. Pide uno nuevo a quien te invitó.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Hola {invite.name}
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              Te invitan a{" "}
              <span className="font-medium text-gray-900">
                {restaurant?.name ?? "este restaurante"}
              </span>{" "}
              como{" "}
              <span className="font-medium text-gray-900">
                {ROLE_LABEL[invite.role] ?? invite.role}
              </span>
              .
            </p>
            <AcceptInviteClient token={token} />
          </>
        )}
      </div>
    </div>
  );
}
