import Link from "next/link";
import ForgotForm from "./forgot-form";

export const metadata = {
  title: "Recuperar contraseña · mipropina",
};

export default function RecuperarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Te enviaremos un enlace para elegir una nueva.
          </p>
        </div>

        <ForgotForm />

        <div className="mt-6 text-center text-sm">
          <Link href="/entrar" className="text-emerald-600 hover:text-emerald-700">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
