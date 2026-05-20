"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SUGGESTED_EMOJIS = ["🍽️", "🍷", "🍻", "☕", "🍕", "🌮", "🍔", "🥘", "🍣"];

export default function NewRestaurantPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [emoji, setEmoji] = useState("🍽️");
  const [color, setColor] = useState("#2ECC87");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function autoSlug(v: string) {
    return v
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function onNameChange(v: string) {
    setName(v);
    if (!slug || slug === autoSlug(name)) setSlug(autoSlug(v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/restaurant/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          logo_emoji: emoji,
          theme_color: color,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error.");
      router.replace(`/admin/${data.restaurant.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <Link
        href="/admin"
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        &larr; Volver
      </Link>

      <h2 className="text-2xl font-bold text-gray-900 mb-1">Nuevo restaurante</h2>
      <p className="text-sm text-gray-500 mb-6">
        Tras crearlo podrás invitar a un gerente por WhatsApp.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            required
            placeholder="La Tasca de María"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            URL pública
          </label>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-400">mipropina.es/t/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              placeholder="la-tasca-de-maria"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Solo minúsculas, números y guiones.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Emoji
          </label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`w-10 h-10 rounded-lg text-xl border ${
                  emoji === e
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Color principal
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-16 h-10 border border-gray-200 rounded-lg cursor-pointer"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            href="/admin"
            className="flex-1 text-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Creando..." : "Crear restaurante"}
          </button>
        </div>
      </form>
    </div>
  );
}
