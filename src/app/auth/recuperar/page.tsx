"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/auth/actualizar-password` }
      );

      if (resetError) throw resetError;
      setSent(true);
    } catch {
      setError("No se pudo enviar el enlace. Inténtalo de nuevo.");
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

        <Card>
          {sent ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5E9]">
                <svg className="h-8 w-8 text-[#2ECC87]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#0D1B1E] mb-2">
                ¡Revisa tu email!
              </h2>
              <p className="text-sm text-gray-500">
                Hemos enviado un enlace a <strong>{email}</strong> para restablecer tu contraseña.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-[#0D1B1E] text-center mb-2">
                Recuperar contraseña
              </h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                Te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />

                {error && (
                  <p className="text-sm text-[#EF4444]">{error}</p>
                )}

                <Button type="submit" loading={loading} className="w-full">
                  Enviar enlace
                </Button>
              </form>
            </>
          )}
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/auth/login" className="text-[#2ECC87] font-semibold hover:underline">
            ← Volver al login
          </Link>
        </p>
      </div>
    </div>
  );
}
