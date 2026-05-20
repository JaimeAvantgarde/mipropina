import Link from "next/link";
import LoginForm from "./login-form";

export const metadata = {
  title: "Entrar · mipropina",
};

export default function EntrarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">Entrar</h1>
          <p className="text-sm text-gray-500 mt-1">
            Accede a tu cuenta de mipropina
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center text-sm">
          <Link
            href="/recuperar"
            className="text-emerald-600 hover:text-emerald-700"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
    </div>
  );
}
