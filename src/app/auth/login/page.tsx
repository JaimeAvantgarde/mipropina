"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login")) {
          setError("Email o contraseña incorrectos.");
        } else {
          setError(authError.message);
        }
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Error al iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5FAF7] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-[family-name:var(--font-serif)] text-3xl text-[#0D1B1E]">
              mi<span className="text-[#2ECC87]">propina</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-md">
          <h2 className="text-xl font-bold text-[#0D1B1E] text-center mb-6">
            Accede a tu cuenta
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <p className="text-sm text-[#EF4444] font-medium">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2">
              Entrar
            </Button>

            <a
              href="/auth/recuperar"
              className="block text-center text-sm text-gray-400 hover:text-[#2ECC87] mt-3"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/registro-restaurante" className="text-[#2ECC87] font-semibold hover:underline">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
