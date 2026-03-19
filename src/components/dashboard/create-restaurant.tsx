"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

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

export function CreateRestaurant({ userEmail, userName, onCreated }: CreateRestaurantProps) {
  const [nombreRestaurante, setNombreRestaurante] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleNombreChange(value: string) {
    setNombreRestaurante(value);
    if (!slugManual) setSlug(slugify(value));
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

    if (!nombreRestaurante.trim() || !slug.trim()) {
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
          slug: slug.trim(),
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

      // Upload logo if provided
      if (logoFile && data.restaurant?.id) {
        const supabase = createClient();
        const ext = logoFile.name.split(".").pop();
        const path = `restaurants/${data.restaurant.id}/logo.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("logos")
          .upload(path, logoFile, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("logos")
            .getPublicUrl(path);

          await fetch("/api/restaurant/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: data.restaurant.id,
              logo_url: urlData.publicUrl,
            }),
          });
        }
      }

      onCreated();
    } catch {
      setError("Error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5E9]">
            <span className="text-3xl">🍽️</span>
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-3xl text-[#0D1B1E] mb-2">
            Configura tu restaurante
          </h1>
          <p className="text-sm text-gray-500">
            Completa estos datos para empezar a recibir propinas digitales.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  <span className="font-medium text-[#2ECC87]">mipropina.es/t/{slug}</span>
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-[#EF4444]">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Crear mi restaurante
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
