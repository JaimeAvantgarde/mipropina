"use client";

import { useState, useEffect, useRef } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AjustesPage() {
  const { data, loading, refetch } = useDashboard();
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<{
    charges_enabled?: boolean;
    payouts_enabled?: boolean;
    details_submitted?: boolean;
  } | null>(null);

  // Logo upload
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate form from real data
  useEffect(() => {
    if (data?.restaurant) {
      setName(data.restaurant.name);
      setSlug(data.restaurant.slug);
      setLogoPreview(data.restaurant.logo_url || null);

      // Fetch Stripe Connect status if connected
      if (data.restaurant.stripe_account_id) {
        fetch(`/api/stripe/connect/status?account_id=${data.restaurant.stripe_account_id}`)
          .then((r) => r.json())
          .then(setStripeStatus)
          .catch(() => {});
      }
    }
  }, [data?.restaurant]);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imagenes (JPG, PNG, WebP).");
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

  async function handleUploadLogo() {
    if (!logoFile || !data?.restaurant) return;
    setUploadingLogo(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", logoFile);
      formData.append("restaurant_id", data.restaurant.id);
      const res = await fetch("/api/restaurant/upload-logo", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setLogoFile(null);
      setLogoPreview(json.logo_url);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen");
    } finally {
      setUploadingLogo(false);
    }
  }

  const handleConnectStripe = async () => {
    if (!data?.restaurant) return;
    setConnectingStripe(true);
    try {
      const res = await fetch("/api/stripe/connect/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: data.restaurant.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al conectar con Stripe");
      setConnectingStripe(false);
    }
  };

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

  const handleDelete = async () => {
    if (!data?.restaurant) return;
    if (confirmText !== "ELIMINAR") return;

    setDeleting(true);
    setError("");

    try {
      const res = await fetch("/api/restaurant/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.restaurant.id }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      // Sign out and redirect to home
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el restaurante");
      setDeleting(false);
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
        {/* Logo */}
        <Card>
          <h3 className="text-lg font-bold text-[#0D1B1E] mb-5">
            Logo del restaurante
          </h3>
          <div className="flex items-center gap-5">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative cursor-pointer group"
            >
              {logoPreview ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm ring-2 ring-gray-100">
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#F5FAF7] flex items-center justify-center shadow-sm ring-2 ring-gray-100">
                  <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21zm14.25-15.75a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-[#0D1B1E]">
                {logoPreview ? "Cambiar logo" : "Subir logo"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG o WebP. Max 5MB</p>
              {logoFile && (
                <Button
                  size="sm"
                  onClick={handleUploadLogo}
                  loading={uploadingLogo}
                  className="mt-2"
                >
                  Guardar logo
                </Button>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleLogoChange}
            className="hidden"
          />
        </Card>

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
              Cuenta de pagos
            </h3>
            {data?.restaurant.stripe_account_id ? (
              <Badge variant={stripeStatus?.charges_enabled ? "active" : "pending"}>
                {stripeStatus?.charges_enabled ? "Activa" : stripeStatus?.details_submitted ? "En revision" : "Incompleta"}
              </Badge>
            ) : (
              <Badge variant="pending">No conectada</Badge>
            )}
          </div>

          {data?.restaurant.stripe_account_id && stripeStatus ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F5FAF7]">
                <div className={`w-3 h-3 rounded-full ${stripeStatus.charges_enabled ? "bg-[#2ECC87]" : "bg-[#F59E0B]"}`} />
                <span className="text-sm text-[#0D1B1E]">
                  {stripeStatus.charges_enabled ? "Puede recibir pagos" : "Pagos pendientes de activacion"}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F5FAF7]">
                <div className={`w-3 h-3 rounded-full ${stripeStatus.payouts_enabled ? "bg-[#2ECC87]" : "bg-[#F59E0B]"}`} />
                <span className="text-sm text-[#0D1B1E]">
                  {stripeStatus.payouts_enabled ? "Transferencias SEPA activas" : "Transferencias pendientes de activacion"}
                </span>
              </div>
              {!stripeStatus.charges_enabled && (
                <Button variant="secondary" onClick={handleConnectStripe} loading={connectingStripe}>
                  Completar configuracion
                </Button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-5">
                Conecta tu cuenta bancaria para recibir las propinas de tus clientes.
                Se te pedira verificar tu identidad (obligatorio por ley).
              </p>
              <Button onClick={handleConnectStripe} loading={connectingStripe}>
                <span className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect width="20" height="20" rx="4" fill="#635BFF" />
                    <path
                      d="M9.3 8.3c0-.5.4-.7 1-.7.9 0 2 .3 2.9.8V6c-1-.4-1.9-.5-2.9-.5-2.4 0-3.9 1.2-3.9 3.3 0 3.2 4.4 2.7 4.4 4.1 0 .6-.5.8-1.2.8-1 0-2.3-.4-3.3-1v2.5c1.1.5 2.2.7 3.3.7 2.4 0 4.1-1.2 4.1-3.3 0-3.5-4.4-2.9-4.4-4.3z"
                      fill="white"
                    />
                  </svg>
                  Conectar cuenta bancaria
                </span>
              </Button>
            </>
          )}
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

          {!showDeleteConfirm ? (
            <button
              className="inline-flex items-center justify-center py-3 px-6 text-[15px] font-bold text-red-600 bg-red-50 rounded-[14px] hover:bg-red-100 transition-colors cursor-pointer"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Eliminar restaurante
            </button>
          ) : (
            <div className="space-y-3 p-4 rounded-xl bg-red-50">
              <p className="text-sm font-medium text-red-700">
                Escribe <strong>ELIMINAR</strong> para confirmar:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="ELIMINAR"
                className="w-full px-4 py-3 text-sm rounded-xl border-2 border-red-200 focus:border-red-400 outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={confirmText !== "ELIMINAR" || deleting}
                  className="inline-flex items-center justify-center py-3 px-6 text-[15px] font-bold text-white bg-red-600 rounded-[14px] hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? "Eliminando..." : "Confirmar eliminacion"}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setConfirmText("");
                  }}
                  className="inline-flex items-center justify-center py-3 px-6 text-[15px] font-medium text-gray-600 bg-white rounded-[14px] hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
