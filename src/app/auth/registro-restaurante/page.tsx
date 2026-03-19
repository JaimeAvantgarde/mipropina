"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function RegistroPage() {
  const [done, setDone] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !email.trim()) {
      setError("Nombre y email son obligatorios.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          data: { full_name: nombre.trim() },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      setDone(true);
    } catch {
      setError("Error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5FAF7] px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <span className="font-[family-name:var(--font-serif)] text-3xl text-[#0D1B1E]">
              mi<span className="text-[#2ECC87]">propina</span>
            </span>
          </div>
          <Card>
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5E9]">
                <svg className="h-8 w-8 text-[#2ECC87]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h1 className="mb-2 font-[family-name:var(--font-serif)] text-2xl text-[#0D1B1E]">
                ¡Revisa tu email!
              </h1>
              <p className="text-sm text-gray-500">
                Hemos enviado un enlace de acceso a <strong>{email}</strong>.
                Haz clic en el enlace para entrar a tu panel de control.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5FAF7] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <a href="/" className="inline-block">
            <span className="font-[family-name:var(--font-serif)] text-3xl text-[#0D1B1E]">
              mi<span className="text-[#2ECC87]">propina</span>
            </span>
          </a>
        </div>

        <Card>
          <h1 className="mb-1 font-[family-name:var(--font-serif)] text-2xl text-[#0D1B1E]">
            Crea tu cuenta
          </h1>
          <p className="mb-6 text-sm text-gray-500">
            Regístrate y configura tu restaurante en menos de 5 minutos.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Tu nombre"
              placeholder="Ej: María García"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="maria@restaurante.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && (
              <p className="text-sm text-[#EF4444]">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Crear mi cuenta
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{" "}
            <a href="/auth/login" className="font-medium text-[#2ECC87] hover:underline">
              Acceder
            </a>
          </p>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-400">
          Al registrarte aceptas los{" "}
          <a href="#" className="underline hover:text-gray-600">términos de servicio</a>{" "}
          y la{" "}
          <a href="#" className="underline hover:text-gray-600">política de privacidad</a>
        </p>
      </div>
    </div>
  );
}
