import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStaffSession } from "@/lib/session";
import WelcomeForm from "./welcome-form";

export const dynamic = "force-dynamic";

export default async function BienvenidaPage() {
  const session = await getStaffSession();
  if (!session) redirect("/");
  if (session.role !== "manager") redirect("/dashboard");

  const { data: staff } = await supabaseAdmin
    .from("staff")
    .select("name, email")
    .eq("id", session.staffId)
    .maybeSingle();

  if (staff?.email) redirect("/dashboard");

  const { data: restaurant } = await supabaseAdmin
    .from("restaurant")
    .select("name, logo_emoji")
    .eq("id", session.restaurantId)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">{restaurant?.logo_emoji ?? "👋"}</div>
          <h1 className="text-xl font-bold text-gray-900">
            ¡Bienvenido/a, {staff?.name ?? "gerente"}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Vamos a configurar {restaurant?.name ?? "tu restaurante"}.
          </p>
        </div>

        <WelcomeForm />
      </div>
    </div>
  );
}
