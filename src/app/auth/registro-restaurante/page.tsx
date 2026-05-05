"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { GoogleButton } from "@/components/auth/google-button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !email.trim() || !password) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: signUpData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: nombre.trim() },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("Este email ya está registrado. ¿Quieres acceder?");
        } else {
          setError(authError.message);
        }
        return;
      }

      // If signUp didn't return a session (email confirmation required), try login
      if (!signUpData.session) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (loginError) {
          setError("Cuenta creada pero no se pudo iniciar sesión: " + loginError.message);
          return;
        }
      }

      router.push("/dashboard");
    } catch {
      setError("Error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5FAF7] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="inline-block" aria-label="mipropina">
            <img
              src="/logos/mipropina-logo-verde-transparente.svg"
              alt="mipropina"
              className="h-24 w-auto"
            />
          </Link>
        </div>

        <Card>
          <h1 className="mb-1 font-[family-name:var(--font-serif)] text-2xl text-[#0D1B1E]">
            Crea tu cuenta
          </h1>
          <p className="mb-6 text-sm text-gray-500">
            Regístrate y configura tu restaurante en menos de 5 minutos.
          </p>

          {/* Google signup */}
          <GoogleButton label="Registrarse con Google" />

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">o con email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

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
              autoComplete="email"
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
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
          <a href="/legal/terminos" className="underline hover:text-gray-600">términos de servicio</a>{" "}
          y la{" "}
          <a href="/legal/privacidad" className="underline hover:text-gray-600">política de privacidad</a>
        </p>
      </div>
    </div>
  );
}
