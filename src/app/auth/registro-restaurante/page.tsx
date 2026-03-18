"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Step = "cuenta" | "restaurante" | "exito";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function RegistroRestaurantePage() {
  const [step, setStep] = useState<Step>("cuenta");

  // Cuenta
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  // Restaurante
  const [nombreRestaurante, setNombreRestaurante] = useState("");
  const [slug, setSlug] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar 5MB.");
      return;
    }

    setLogoFile(file);
    setError("");
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleNombreRestauranteChange(value: string) {
    setNombreRestaurante(value);
    if (!slugManual) {
      setSlug(slugify(value));
    }
  }

  async function handleCrearCuenta(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !email.trim()) {
      setError("Nombre y email son obligatorios.");
      return;
    }

    // In production: create Supabase auth user + send magic link
    // For now, move to next step
    setStep("restaurante");
  }

  async function handleCrearRestaurante(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!nombreRestaurante.trim()) {
      setError("El nombre del restaurante es obligatorio.");
      setLoading(false);
      return;
    }

    if (!slug.trim()) {
      setError("La URL de tu restaurante es obligatoria.");
      setLoading(false);
      return;
    }

    // In production: insert restaurant + staff (owner) in Supabase
    // For now, simulate success
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setStep("exito");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5FAF7] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <a href="/" className="inline-block">
            <span className="font-[family-name:var(--font-serif)] text-3xl text-[#0D1B1E]">
              mi<span className="text-[#2ECC87]">propina</span>
            </span>
          </a>
        </div>

        {/* Progress */}
        {step !== "exito" && (
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  step === "cuenta"
                    ? "bg-[#2ECC87] text-[#0D1B1E]"
                    : "bg-[#2ECC87]/20 text-[#2ECC87]"
                }`}
              >
                {step === "restaurante" ? "✓" : "1"}
              </div>
              <span
                className={`text-sm font-medium ${
                  step === "cuenta" ? "text-[#0D1B1E]" : "text-gray-400"
                }`}
              >
                Tu cuenta
              </span>
            </div>
            <div className="h-px w-8 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  step === "restaurante"
                    ? "bg-[#2ECC87] text-[#0D1B1E]"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                2
              </div>
              <span
                className={`text-sm font-medium ${
                  step === "restaurante" ? "text-[#0D1B1E]" : "text-gray-400"
                }`}
              >
                Tu restaurante
              </span>
            </div>
          </div>
        )}

        {/* Step 1: Cuenta */}
        {step === "cuenta" && (
          <Card>
            <h1 className="mb-2 font-[family-name:var(--font-serif)] text-2xl text-[#0D1B1E]">
              Crea tu cuenta de gerente
            </h1>
            <p className="mb-6 text-sm text-gray-500">
              Empieza a recibir propinas digitales en tu restaurante.
            </p>

            <form onSubmit={handleCrearCuenta} className="space-y-4">
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
              <Input
                label="Teléfono (opcional)"
                type="tel"
                placeholder="+34 612 345 678"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />

              {error && (
                <p className="text-sm text-[#EF4444]">{error}</p>
              )}

              <Button type="submit" className="w-full">
                Continuar
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              ¿Ya tienes cuenta?{" "}
              <a href="/auth/login" className="font-medium text-[#2ECC87] hover:underline">
                Acceder
              </a>
            </p>
          </Card>
        )}

        {/* Step 2: Restaurante */}
        {step === "restaurante" && (
          <Card>
            <h1 className="mb-2 font-[family-name:var(--font-serif)] text-2xl text-[#0D1B1E]">
              Configura tu restaurante
            </h1>
            <p className="mb-6 text-sm text-gray-500">
              Estos datos se mostrarán a tus clientes al dejar propina.
            </p>

            <form onSubmit={handleCrearRestaurante} className="space-y-4">
              {/* Logo upload */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Logo del restaurante
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-[#F5FAF7] p-6 transition-colors hover:border-[#2ECC87]"
                >
                  {logoPreview ? (
                    <div className="relative h-24 w-24 overflow-hidden rounded-2xl shadow-md">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21zm14.25-15.75a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0z" />
                      </svg>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-sm font-medium text-[#2ECC87]">
                      {logoPreview ? "Cambiar imagen" : "Subir imagen"}
                    </p>
                    <p className="text-xs text-gray-400">JPG, PNG o WebP. Máx 5MB</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </div>

              <Input
                label="Nombre del restaurante"
                placeholder="Ej: La Tasca de María"
                value={nombreRestaurante}
                onChange={(e) => handleNombreRestauranteChange(e.target.value)}
                required
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  URL de propinas
                </label>
                <div className="flex items-center overflow-hidden rounded-[14px] border-2 border-[#E5E7EB] bg-white focus-within:border-[#2ECC87]">
                  <span className="bg-gray-50 px-3 py-3.5 text-sm text-gray-400">
                    mipropina.es/t/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlugManual(true);
                      setSlug(slugify(e.target.value));
                    }}
                    placeholder="tu-restaurante"
                    className="w-full bg-white px-2 py-3.5 text-sm font-medium text-[#0D1B1E] outline-none"
                  />
                </div>
                {slug && (
                  <p className="mt-1.5 text-xs text-gray-400">
                    Tus clientes escanearán el QR y verán:{" "}
                    <span className="font-medium text-[#2ECC87]">
                      mipropina.es/t/{slug}
                    </span>
                  </p>
                )}
              </div>

              {error && (
                <p className="text-sm text-[#EF4444]">{error}</p>
              )}

              <Button type="submit" loading={loading} className="w-full">
                Crear mi restaurante
              </Button>

              <button
                type="button"
                onClick={() => setStep("cuenta")}
                className="w-full text-center text-sm text-gray-400 hover:text-gray-600"
              >
                ← Volver
              </button>
            </form>
          </Card>
        )}

        {/* Success */}
        {step === "exito" && (
          <Card>
            <div className="py-4 text-center">
              <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#E8F5E9]">
                {logoPreview ? (
                  <Image src={logoPreview} alt={nombreRestaurante} fill className="object-cover" />
                ) : (
                  <span className="text-4xl">🍽️</span>
                )}
              </div>

              <h1 className="mb-2 font-[family-name:var(--font-serif)] text-2xl text-[#0D1B1E]">
                ¡{nombreRestaurante} está listo!
              </h1>

              <p className="mb-2 text-sm text-gray-500">
                Tu restaurante ya puede recibir propinas digitales.
              </p>

              <div className="my-6 rounded-2xl bg-[#F5FAF7] p-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Tu página de propinas
                </p>
                <p className="font-medium text-[#2ECC87]">
                  mipropina.es/t/{slug}
                </p>
              </div>

              <div className="space-y-3">
                <a href="/dashboard">
                  <Button className="w-full">
                    Ir a mi panel de control
                  </Button>
                </a>
                <a
                  href={`/t/${slug}`}
                  className="block text-sm font-medium text-[#2ECC87] hover:underline"
                >
                  Ver cómo lo ven mis clientes →
                </a>
              </div>
            </div>
          </Card>
        )}

        {/* Footer note */}
        {step !== "exito" && (
          <p className="mt-6 text-center text-xs text-gray-400">
            Al registrarte aceptas los{" "}
            <a href="#" className="underline hover:text-gray-600">
              términos de servicio
            </a>{" "}
            y la{" "}
            <a href="#" className="underline hover:text-gray-600">
              política de privacidad
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
