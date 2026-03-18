"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function RegistroContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState<"loading" | "form" | "success" | "invalid">("loading");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-filled from invite
  const [restaurantName, setRestaurantName] = useState("");
  const [inviteName, setInviteName] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [iban, setIban] = useState("");

  useEffect(() => {
    if (!token) {
      setStep("invalid");
      return;
    }

    // Validate token against Supabase
    async function validateToken() {
      try {
        const res = await fetch(`/api/invite/validate?token=${encodeURIComponent(token!)}`);
        const data = await res.json();

        if (!res.ok || !data.valid) {
          setStep("invalid");
          return;
        }

        setRestaurantName(data.restaurant_name);
        setInviteName(data.invite_name || "");
        if (data.invite_name) setName(data.invite_name);
        setStep("form");
      } catch {
        setStep("invalid");
      }
    }

    validateToken();
  }, [token]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/staff/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          iban: iban.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear la cuenta.");
        return;
      }

      if (data.restaurant_name) {
        setRestaurantName(data.restaurant_name);
      }

      setStep("success");
    } catch {
      setError("Error al crear la cuenta. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // Loading state
  if (step === "loading") {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-md text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#2ECC87]" />
        <p className="text-sm text-gray-500">Verificando invitación...</p>
      </div>
    );
  }

  // Invalid / no token
  if (step === "invalid") {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <svg className="h-8 w-8 text-[#EF4444]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#0D1B1E] mb-2">
          Enlace no válido
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Este enlace de invitación no existe o ha expirado. Pide a tu gerente que te envíe uno nuevo.
        </p>
        <Link href="/">
          <Button variant="secondary" className="w-full">
            Volver al inicio
          </Button>
        </Link>
      </div>
    );
  }

  // Success
  if (step === "success") {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5E9]">
          <svg className="h-8 w-8 text-[#2ECC87]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#0D1B1E] mb-2">
          ¡Bienvenido al equipo!
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Tu cuenta en <strong>{restaurantName}</strong> está lista. Ya puedes acceder y ver tus propinas.
        </p>
        <Link href="/auth/login">
          <Button className="w-full">
            Acceder a mi cuenta
          </Button>
        </Link>
      </div>
    );
  }

  // Registration form
  return (
    <div className="bg-white rounded-2xl p-8 shadow-md">
      {/* Restaurant badge */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-4 py-1.5 text-sm font-semibold text-[#1B5E20] mb-3">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Invitación verificada
        </div>
        <h2 className="text-xl font-bold text-[#0D1B1E] mb-1">
          Únete a {restaurantName}
        </h2>
        <p className="text-sm text-gray-500">
          {inviteName ? `Hola ${inviteName}, completa` : "Completa"} tus datos para empezar a recibir propinas.
        </p>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <Input
          label="Nombre completo"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Teléfono"
          type="tel"
          placeholder="+34 600 000 000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Input
          label="IBAN (para recibir tus propinas)"
          placeholder="ES00 0000 0000 0000 0000 0000"
          value={iban}
          onChange={(e) => setIban(e.target.value.toUpperCase())}
        />
        <p className="text-xs text-gray-400 -mt-2">
          Puedes añadirlo más tarde desde tu perfil.
        </p>

        {error && (
          <p className="text-sm text-[#EF4444] font-medium">{error}</p>
        )}

        <Button type="submit" loading={loading} className="w-full mt-2">
          Crear mi cuenta
        </Button>
      </form>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <div className="min-h-screen bg-[#F5FAF7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-[family-name:var(--font-serif)] text-3xl text-[#0D1B1E]">
              mi<span className="text-[#2ECC87]">propina</span>
            </span>
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="bg-white rounded-2xl p-8 shadow-md text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#2ECC87]" />
              <p className="text-sm text-gray-500">Cargando...</p>
            </div>
          }
        >
          <RegistroContent />
        </Suspense>
      </div>
    </div>
  );
}
