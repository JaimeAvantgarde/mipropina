"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type Step = "code" | "form" | "success";

export default function RegistroPage() {
  const [step, setStep] = useState<Step>("code");
  const [inviteCode, setInviteCode] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [iban, setIban] = useState("");

  function formatInviteCode(value: string): string {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length <= 2) return clean;
    return `MP-${clean.slice(2, 8)}`;
  }

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === "") {
      setInviteCode("");
      return;
    }
    setInviteCode(formatInviteCode(raw));
  }

  async function validateCode(e: React.FormEvent) {
    e.preventDefault();
    if (inviteCode.length < 5) return;

    setLoading(true);
    setError("");

    try {
      // Mock validation: any code starting with MP- is valid
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (!inviteCode.startsWith("MP-")) {
        setError("Código de invitación no válido.");
        return;
      }

      // Mock restaurant name
      setRestaurantName("La Tasca de María");
      setStep("form");
    } catch {
      setError("Error al validar el código. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Mock registration
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStep("success");
    } catch {
      setError("Error al crear la cuenta. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-serif text-dark tracking-tight">
              mipropina
            </h1>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-md">
          {step === "code" && (
            <>
              <h2 className="text-xl font-bold text-dark text-center mb-2">
                Únete a tu equipo
              </h2>
              <p className="text-sm text-foreground/60 text-center mb-6">
                Introduce el código de invitación que te ha dado tu gerente.
              </p>

              <form onSubmit={validateCode} className="flex flex-col gap-4">
                <Input
                  label="Código de invitación"
                  placeholder="MP-XXXXXX"
                  value={inviteCode}
                  onChange={handleCodeChange}
                  maxLength={9}
                  autoFocus
                  className="text-center text-lg font-semibold tracking-widest"
                />

                {error && (
                  <p className="text-[13px] text-error font-medium" role="alert">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  className="w-full mt-2"
                  disabled={inviteCode.length < 5}
                >
                  Validar código
                </Button>
              </form>
            </>
          )}

          {step === "form" && (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-3">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                  Código válido
                </div>
                <h2 className="text-xl font-bold text-dark mb-1">
                  Crea tu cuenta
                </h2>
                <p className="text-sm text-foreground/60">
                  Te han invitado a{" "}
                  <span className="font-semibold text-dark">
                    {restaurantName}
                  </span>
                </p>
              </div>

              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <Input
                  label="Nombre completo"
                  placeholder="Juan García"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="juan@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />

                <Input
                  label="Teléfono"
                  type="tel"
                  placeholder="+34 600 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />

                <Input
                  label="IBAN (opcional)"
                  placeholder="ES00 0000 0000 0000 0000 0000"
                  value={iban}
                  onChange={(e) => setIban(e.target.value.toUpperCase())}
                />

                {error && (
                  <p className="text-[13px] text-error font-medium" role="alert">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  className="w-full mt-2"
                >
                  Crear mi cuenta
                </Button>
              </form>
            </>
          )}

          {step === "success" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-dark mb-2">
                ¡Cuenta creada!
              </h2>
              <p className="text-[15px] text-foreground mb-6">
                Ya puedes acceder con tu email.
              </p>
              <Link href="/auth/login">
                <Button size="lg" className="w-full">
                  Ir a iniciar sesión
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-foreground/60 mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/auth/login"
            className="text-primary font-semibold hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
