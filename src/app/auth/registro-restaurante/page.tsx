"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function RegistroRestaurantePage() {
  const [done, setDone] = useState(false);

  // All fields in one form
  const [nombreRestaurante, setNombreRestaurante] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleNombreRestauranteChange(value: string) {
    setNombreRestaurante(value);
    if (!slugManual) {
      setSlug(slugify(value));
    }
  }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nombreRestaurante.trim()) {
      setError("El nombre del restaurante es obligatorio.");
      return;
    }
    if (!slug.trim()) {
      setError("La URL de tu restaurante es obligatoria.");
      return;
    }
    if (!nombre.trim() || !email.trim()) {
      setError("Tu nombre y email son obligatorios.");
      return;
    }

    setLoading(true);

    // TODO: In production:
    // 1. Create Supabase auth user (magic link)
    // 2. Upload logo to Supabase Storage
    // 3. Insert restaurant record
    // 4. Insert staff record (role: owner)
    // 5. Create QR code record
    void logoFile; // Will be uploaded to Supabase Storage
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setLoading(false);
    setDone(true);
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
              <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#E8F5E9] shadow-md">
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

              <p className="mb-6 text-sm text-gray-500">
                Hemos enviado un enlace de acceso a <strong>{email}</strong>.
                Revisa tu email para entrar a tu panel de control.
              </p>

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
        </div>
      </div>
    );
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

        <Card>
          <h1 className="mb-1 font-[family-name:var(--font-serif)] text-2xl text-[#0D1B1E]">
            Registra tu restaurante
          </h1>
          <p className="mb-6 text-sm text-gray-500">
            Crea tu cuenta y empieza a recibir propinas digitales en minutos.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* --- Restaurant section --- */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#2ECC87]">
                Tu restaurante
              </p>

              {/* Logo upload */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Logo
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 bg-[#F5FAF7] p-4 transition-colors hover:border-[#2ECC87]"
                >
                  {logoPreview ? (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl shadow-sm">
                      <Image src={logoPreview} alt="Logo" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21zm14.25-15.75a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-[#2ECC87]">
                      {logoPreview ? "Cambiar imagen" : "Subir logo"}
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
                    Tus clientes verán:{" "}
                    <span className="font-medium text-[#2ECC87]">
                      mipropina.es/t/{slug}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* --- Owner section --- */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#2ECC87]">
                Tus datos (gerente)
              </p>

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
            </div>

            {error && (
              <p className="text-sm text-[#EF4444]">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Crear mi restaurante
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
          <a href="#" className="underline hover:text-gray-600">
            términos de servicio
          </a>{" "}
          y la{" "}
          <a href="#" className="underline hover:text-gray-600">
            política de privacidad
          </a>
        </p>
      </div>
    </div>
  );
}
