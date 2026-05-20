import { supabaseAdmin } from "@/lib/supabase/admin";
import ResetForm from "./reset-form";

export const metadata = {
  title: "Nueva contraseña · mipropina",
};

export const dynamic = "force-dynamic";

export default async function RecuperarTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const { data: staff } = await supabaseAdmin
    .from("staff")
    .select("id, password_reset_expires_at, status")
    .eq("password_reset_token", token)
    .maybeSingle();

  const isValid =
    staff &&
    staff.status !== "inactive" &&
    staff.password_reset_expires_at &&
    new Date(staff.password_reset_expires_at) >= new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            Elige una nueva contraseña
          </h1>
        </div>

        {isValid ? (
          <ResetForm token={token} />
        ) : (
          <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-3 border border-red-200">
            Este enlace no es válido o ha caducado. Pide uno nuevo desde{" "}
            <a href="/recuperar" className="underline">
              /recuperar
            </a>
            .
          </div>
        )}
      </div>
    </div>
  );
}
