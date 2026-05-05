"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ActualizarPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase sets the session automatically when the user lands here
    // via the recovery link. We listen for the PASSWORD_RECOVERY event
    // to confirm the session is ready.
    const supabase = createClient();

    // Check if there's already an active session (user landed with recovery link)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Introduce una contraseña.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5FAF7] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" aria-label="mipropina">
            <img
              src="/logos/mipropina-logo-verde-transparente.svg"
              alt="mipropina"
              className="h-24 w-auto"
            />
          </Link>
        </div>

        <Card>
          {done ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5E9]">
                <svg className="h-8 w-8 text-[#2ECC87]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#0D1B1E] mb-2">Contraseña actualizada</h2>
              <p className="text-sm text-gray-500">Redirigiendo al dashboard...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-[#0D1B1E] text-center mb-2">
                Nueva contraseña
              </h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                Elige una contraseña nueva para tu cuenta.
              </p>

              {!sessionReady && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 text-sm text-amber-700">
                  Verificando tu enlace de recuperación...
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nueva contraseña"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  autoComplete="new-password"
                />
                <Input
                  label="Confirmar contraseña"
                  type="password"
                  placeholder="Repite la contraseña"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />

                {error && (
                  <p className="text-sm text-[#EF4444] font-medium">{error}</p>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  disabled={!sessionReady}
                  className="w-full"
                >
                  Actualizar contraseña
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
