"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FOOD_EMOJIS = ["🍽️", "🍕", "🍔", "🍣", "🌮", "🥘", "🍷", "☕", "🍰", "🥗"];

export default function AjustesPage() {
  const { data, loading, refetch } = useDashboard();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🍽️");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Populate form from real data
  useEffect(() => {
    if (data?.restaurant) {
      setName(data.restaurant.name);
      setSlug(data.restaurant.slug);
      setSelectedEmoji(data.restaurant.logo_emoji || "🍽️");
    }
  }, [data?.restaurant]);

  const handleSave = async () => {
    if (!data?.restaurant) return;

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/restaurant/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.restaurant.id,
          name: name.trim(),
          slug: slug.trim(),
          logo_emoji: selectedEmoji,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error al guardar");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-9 bg-gray-200 rounded w-64 animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 rounded w-80 animate-pulse" />
        </div>
        <div className="flex flex-col gap-6 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-5" />
            <div className="space-y-4">
              <div className="h-12 bg-gray-100 rounded" />
              <div className="h-12 bg-gray-100 rounded" />
              <div className="h-12 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-[family-name:var(--font-serif)] text-[#0D1B1E]">
          Ajustes del restaurante
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configura los datos de tu restaurante y la conexion con Stripe
        </p>
      </div>

      <div className="flex flex-col gap-6 max-w-2xl">
        {/* Restaurant info */}
        <Card>
          <h3 className="text-lg font-bold text-[#0D1B1E] mb-5">
            Informacion del restaurante
          </h3>
          <div className="flex flex-col gap-4">
            <Input
              label="Nombre del restaurante"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Slug (URL)"
              value={slug}
              onChange={(e) =>
                setSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "")
                )
              }
            />
            <p className="text-xs text-gray-400 -mt-2">
              Tu URL: mipropina.es/t/<strong>{slug}</strong>
            </p>

            {/* Emoji picker */}
            <div>
              <label className="text-sm font-semibold text-dark-mid block mb-2">
                Emoji del restaurante
              </label>
              <div className="flex gap-2 flex-wrap">
                {FOOD_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl transition-all cursor-pointer ${
                      selectedEmoji === emoji
                        ? "bg-[#2ECC87]/15 ring-2 ring-[#2ECC87] scale-110"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button onClick={handleSave} className="self-start mt-2" loading={saving}>
              {saved ? "Guardado" : "Guardar cambios"}
            </Button>
          </div>
        </Card>

        {/* Stripe Connect */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#0D1B1E]">
              Stripe Connect
            </h3>
            <Badge variant={data?.restaurant.stripe_account_id ? "active" : "pending"}>
              {data?.restaurant.stripe_account_id ? "Conectado" : "No conectado"}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Conecta tu cuenta de Stripe para recibir pagos y transferir propinas
            a tu equipo de forma automatica.
          </p>
          <Button variant="secondary">
            <span className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect width="20" height="20" rx="4" fill="#635BFF" />
                <path
                  d="M9.3 8.3c0-.5.4-.7 1-.7.9 0 2 .3 2.9.8V6c-1-.4-1.9-.5-2.9-.5-2.4 0-3.9 1.2-3.9 3.3 0 3.2 4.4 2.7 4.4 4.1 0 .6-.5.8-1.2.8-1 0-2.3-.4-3.3-1v2.5c1.1.5 2.2.7 3.3.7 2.4 0 4.1-1.2 4.1-3.3 0-3.5-4.4-2.9-4.4-4.3z"
                  fill="white"
                />
              </svg>
              Conectar Stripe
            </span>
          </Button>
        </Card>

        {/* Danger zone */}
        <Card className="border-2 border-red-200">
          <h3 className="text-lg font-bold text-red-600 mb-2">
            Zona peligrosa
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            Al eliminar tu restaurante se borraran todos los datos asociados:
            equipo, propinas, historial y codigos QR. Esta accion es irreversible.
          </p>
          <button
            className="inline-flex items-center justify-center py-3 px-6 text-[15px] font-bold text-red-600 bg-red-50 rounded-[14px] hover:bg-red-100 transition-colors cursor-pointer"
            onClick={() => {
              if (confirm("Estas seguro de que quieres eliminar tu restaurante? Esta accion no se puede deshacer.")) {
                // TODO: Delete restaurant via API
              }
            }}
          >
            Eliminar restaurante
          </button>
        </Card>
      </div>
    </div>
  );
}
