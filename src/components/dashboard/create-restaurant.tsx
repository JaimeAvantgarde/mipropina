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

interface CreateRestaurantProps {
  userEmail: string;
  userName: string;
  onCreated: () => void;
}

type Step = "restaurant" | "stripe" | "done";

export function CreateRestaurant({ userEmail, userName, onCreated }: CreateRestaurantProps) {
  const [step, setStep] = useState<Step>("restaurant");
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [slug, setSlug] = useState("");

  // Restaurant form
  const [nombreRestaurante, setNombreRestaurante] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connectingStripe, setConnectingStripe] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleNombreChange(value: string) {
    setNombreRestaurante(value);
    if (!slugManual) setSlugInput(slugify(value));
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

  async function handleCreateRestaurant(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nombreRestaurante.trim() || !slugInput.trim()) {
      setError("El nombre y la URL son obligatorios.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/restaurant/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nombreRestaurante.trim(),
          slug: slugInput.trim(),
          logo_emoji: "🍽️",
          owner_name: userName,
          owner_email: userEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear el restaurante.");
        setLoading(false);
        return;
      }

      setRestaurantId(data.restaurant.id);
      setRestaurantName(nombreRestaurante.trim());
      setSlug(slugInput.trim());

      // Upload logo if provided
      if (logoFile && data.restaurant?.id) {
        const formData = new FormData();
        formData.append("file", logoFile);
        formData.append("restaurant_id", data.restaurant.id);
        await fetch("/api/restaurant/upload-logo", {
          method: "POST",
          body: formData,
        });
      }

      // Move to Stripe Connect step
      setStep("stripe");
    } catch {
      setError("Error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConnectStripe() {
    if (!restaurantId) return;
    setConnectingStripe(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/connect/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: restaurantId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Redirect to Stripe onboarding — user will come back to /dashboard after
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al conectar con Stripe");
      setConnectingStripe(false);
    }
  }

  // Step progress indicator
  function StepIndicator() {
    const steps = [
      { num: 1, label: "Restaurante", active: step === "restaurant", done: step !== "restaurant" },
      { num: 2, label: "Cuenta bancaria", active: step === "stripe", done: step === "done" },
    ];

    return (
      <div className="flex items-center justify-center gap-3 mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                s.done ? "bg-[#2ECC87]/20 text-[#2ECC87]" :
                s.active ? "bg-[#2ECC87] text-[#0D1B1E]" :
                "bg-gray-200 text-gray-400"
              }`}>
                {s.done ? "✓" : s.num}
              </div>
              <span className={`text-sm font-medium ${
                s.active ? "text-[#0D1B1E]" : "text-gray-400"
              }`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && <div className="h-px w-8 bg-gray-200" />}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-lg">
        <div className="text-center mb-2">
          <h1 className="font-[family-name:var(--font-serif)] text-3xl text-[#0D1B1E] mb-2">
            Configura tu restaurante
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            Solo 2 pasos para empezar a recibir propinas digitales.
          </p>
        </div>

        <StepIndicator />

        {/* Step 1: Restaurant details */}
        {step === "restaurant" && (
          <Card>
            <form onSubmit={handleCreateRestaurant} className="space-y-5">
              {/* Logo upload */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Logo del restaurante
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
                      {logoPreview ? "Cambiar imagen" : "Subir logo (opcional)"}
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
                onChange={(e) => handleNombreChange(e.target.value)}
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
                    value={slugInput}
                    onChange={(e) => {
                      setSlugManual(true);
                      setSlugInput(slugify(e.target.value));
                    }}
                    placeholder="tu-restaurante"
                    className="w-full bg-white px-2 py-3.5 text-sm font-medium text-[#0D1B1E] outline-none"
                  />
                </div>
                {slugInput && (
                  <p className="mt-1.5 text-xs text-gray-400">
                    Tus clientes verán:{" "}
                    <span className="font-medium text-[#2ECC87]">mipropina.es/t/{slugInput}</span>
                  </p>
                )}
              </div>

              {error && <p className="text-sm text-[#EF4444]">{error}</p>}

              <Button type="submit" loading={loading} className="w-full">
                Siguiente →
              </Button>
            </form>
          </Card>
        )}

        {/* Step 2: Stripe Connect */}
        {step === "stripe" && (
          <Card>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#635BFF]/10">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="6" fill="#635BFF" />
                  <path
                    d="M14.9 13.3c0-.8.6-1.1 1.6-1.1 1.4 0 3.2.4 4.6 1.2V9.6c-1.5-.6-3-.8-4.6-.8-3.8 0-6.2 2-6.2 5.2 0 5.1 7 4.3 7 6.5 0 .9-.8 1.2-1.9 1.2-1.6 0-3.7-.7-5.3-1.6v3.9c1.8.8 3.5 1.1 5.3 1.1 3.8 0 6.5-1.9 6.5-5.2 0-5.5-7-4.5-7-6.6z"
                    fill="white"
                  />
                </svg>
              </div>

              <h2 className="font-[family-name:var(--font-serif)] text-xl text-[#0D1B1E] mb-2">
                Conecta tu cuenta bancaria
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Para recibir las propinas, necesitas verificar tu identidad y añadir tu IBAN.
                Stripe se encarga de todo de forma segura.
              </p>

              <div className="space-y-3 mb-6 text-left">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F5FAF7]">
                  <span className="text-[#2ECC87] mt-0.5">✓</span>
                  <div>
                    <p className="text-sm font-medium text-[#0D1B1E]">Restaurante creado</p>
                    <p className="text-xs text-gray-500">{restaurantName} — mipropina.es/t/{slug}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F5FAF7]">
                  <span className="text-[#F59E0B] mt-0.5">→</span>
                  <div>
                    <p className="text-sm font-medium text-[#0D1B1E]">Verificación de identidad</p>
                    <p className="text-xs text-gray-500">DNI/NIE, datos personales y cuenta bancaria</p>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-[#EF4444] mb-4">{error}</p>}

              <Button onClick={handleConnectStripe} loading={connectingStripe} className="w-full">
                <span className="flex items-center justify-center gap-2">
                  Conectar con Stripe
                  <span className="text-lg">→</span>
                </span>
              </Button>

              <button
                onClick={() => {
                  setStep("done");
                  onCreated();
                }}
                className="mt-4 text-sm text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                Hacerlo más tarde
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
