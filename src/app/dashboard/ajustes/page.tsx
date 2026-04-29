"use client";

import { useState, useEffect, useRef } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const PRESET_COLORS = ["#2ECC87", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

function saveRestaurant(id: string, updates: Record<string, unknown>) {
  return fetch("/api/restaurant/update", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...updates }),
  });
}

export default function AjustesPage() {
  const { data, loading, refetch } = useDashboard();
  const router = useRouter();

  // Basic info
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Stripe Connect
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

  // Theme color
  const [themeColor, setThemeColor] = useState("#2ECC87");
  const [savingColor, setSavingColor] = useState(false);
  const [savedColor, setSavedColor] = useState(false);

  // Tip amounts
  const [tipAmounts, setTipAmounts] = useState<string[]>(["1", "2", "3", "5"]);
  const [customAmountEnabled, setCustomAmountEnabled] = useState(true);
  const [savingAmounts, setSavingAmounts] = useState(false);
  const [savedAmounts, setSavedAmounts] = useState(false);

  // Thank-you message
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [savingMessage, setSavingMessage] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // Email notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [savedEmail, setSavedEmail] = useState(false);

  // Google Maps
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [savingMaps, setSavingMaps] = useState(false);
  const [savedMaps, setSavedMaps] = useState(false);

  // Delete
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate form from real data
  useEffect(() => {
    if (data?.restaurant) {
      const r = data.restaurant;
      setName(r.name);
      setSlug(r.slug);
      setLogoPreview(r.logo_url || null);
      setThemeColor(r.theme_color || "#2ECC87");

      if (r.tip_amounts?.length) {
        setTipAmounts(r.tip_amounts.map((c: number) => String(c / 100)));
      }
      setCustomAmountEnabled(r.custom_amount_enabled !== false);
      setThankYouMessage(r.thank_you_message || "");
      setEmailNotifications(r.email_notifications_enabled !== false);
      setNotificationEmail(r.notification_email || "");
      setGoogleMapsUrl(r.google_maps_url || "");

      if (r.stripe_account_id) {
        fetch(`/api/stripe/connect/status?account_id=${r.stripe_account_id}`)
          .then((res) => res.json())
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
      const res = await fetch("/api/restaurant/upload-logo", { method: "POST", body: formData });
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
      const res = await saveRestaurant(data.restaurant.id, {
        name: name.trim(),
        slug: slug.trim(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveColor = async () => {
    if (!data?.restaurant) return;
    setSavingColor(true);
    try {
      const res = await saveRestaurant(data.restaurant.id, { theme_color: themeColor });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSavedColor(true);
      setTimeout(() => setSavedColor(false), 2000);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el color");
    } finally {
      setSavingColor(false);
    }
  };

  const handleSaveAmounts = async () => {
    if (!data?.restaurant) return;
    const parsed = tipAmounts
      .map((v) => Math.round(parseFloat(v.replace(",", ".")) * 100))
      .filter((n) => !isNaN(n) && n >= 50 && n <= 50000);
    if (parsed.length < 2) {
      setError("Necesitas al menos 2 montos válidos (mínimo 0,50€).");
      return;
    }
    setSavingAmounts(true);
    try {
      const res = await saveRestaurant(data.restaurant.id, {
        tip_amounts: parsed,
        custom_amount_enabled: customAmountEnabled,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSavedAmounts(true);
      setTimeout(() => setSavedAmounts(false), 2000);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar los montos");
    } finally {
      setSavingAmounts(false);
    }
  };

  const handleSaveMessage = async () => {
    if (!data?.restaurant) return;
    setSavingMessage(true);
    try {
      const res = await saveRestaurant(data.restaurant.id, {
        thank_you_message: thankYouMessage.trim() || null,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2000);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el mensaje");
    } finally {
      setSavingMessage(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!data?.restaurant) return;
    setSavingEmail(true);
    try {
      const res = await saveRestaurant(data.restaurant.id, {
        email_notifications_enabled: emailNotifications,
        notification_email: notificationEmail.trim() || null,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSavedEmail(true);
      setTimeout(() => setSavedEmail(false), 2000);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar las notificaciones");
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSaveMaps = async () => {
    if (!data?.restaurant) return;
    setSavingMaps(true);
    try {
      const res = await saveRestaurant(data.restaurant.id, {
        google_maps_url: googleMapsUrl.trim() || null,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSavedMaps(true);
      setTimeout(() => setSavedMaps(false), 2000);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la URL de Google Maps");
    } finally {
      setSavingMaps(false);
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-5" />
              <div className="space-y-4">
                <div className="h-12 bg-gray-100 rounded" />
                <div className="h-12 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
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
          Configura todos los datos de tu restaurante
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-sm text-red-600 max-w-2xl">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6 max-w-2xl">
        {/* Logo */}
        <Card>
          <h3 className="text-lg font-bold text-[#0D1B1E] mb-5">Logo del restaurante</h3>
          <div className="flex items-center gap-5">
            <div onClick={() => fileInputRef.current?.click()} className="relative cursor-pointer group">
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
              <p className="text-sm font-medium text-[#0D1B1E]">{logoPreview ? "Cambiar logo" : "Subir logo"}</p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG o WebP. Max 5MB</p>
              {logoFile && (
                <Button size="sm" onClick={handleUploadLogo} loading={uploadingLogo} className="mt-2">
                  Guardar logo
                </Button>
              )}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoChange} className="hidden" />
        </Card>

        {/* Basic info */}
        <Card>
          <h3 className="text-lg font-bold text-[#0D1B1E] mb-5">Informacion del restaurante</h3>
          <div className="flex flex-col gap-4">
            <Input label="Nombre del restaurante" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              label="Slug (URL)"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
            />
            <p className="text-xs text-gray-400 -mt-2">
              Tu URL: mipropina.es/t/<strong>{slug}</strong>
            </p>
            <Button onClick={handleSave} className="self-start mt-2" loading={saving}>
              {saved ? "Guardado ✓" : "Guardar cambios"}
            </Button>
          </div>
        </Card>

        {/* Theme color */}
        <Card>
          <h3 className="text-lg font-bold text-[#0D1B1E] mb-1">Color de marca</h3>
          <p className="text-sm text-gray-500 mb-5">Color principal de tu página de propina</p>
          <div className="flex flex-wrap gap-3 mb-4">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setThemeColor(color)}
                className="w-10 h-10 rounded-full transition-all cursor-pointer"
                style={{
                  backgroundColor: color,
                  outline: themeColor === color ? `3px solid ${color}` : "none",
                  outlineOffset: "2px",
                }}
              />
            ))}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-10 h-10 rounded-full cursor-pointer border-0"
                title="Color personalizado"
              />
              <span className="text-xs text-gray-400 font-mono">{themeColor}</span>
            </div>
          </div>
          <div
            className="w-full h-10 rounded-xl mb-4 flex items-center justify-center text-sm font-semibold text-white"
            style={{ backgroundColor: themeColor }}
          >
            Vista previa del botón
          </div>
          <Button onClick={handleSaveColor} loading={savingColor} className="self-start">
            {savedColor ? "Guardado ✓" : "Guardar color"}
          </Button>
        </Card>

        {/* Tip amounts */}
        <Card>
          <h3 className="text-lg font-bold text-[#0D1B1E] mb-1">Montos de propina</h3>
          <p className="text-sm text-gray-500 mb-5">
            Los botones que verá el cliente al dejar propina (mínimo 2, máximo 8)
          </p>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {tipAmounts.map((val, i) => (
              <div key={i} className="relative">
                <Input
                  value={val}
                  onChange={(e) => {
                    const next = [...tipAmounts];
                    next[i] = e.target.value;
                    setTipAmounts(next);
                  }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mb-5">
            {tipAmounts.length < 8 && (
              <button
                type="button"
                onClick={() => setTipAmounts([...tipAmounts, ""])}
                className="text-sm text-[#2ECC87] font-semibold cursor-pointer hover:underline"
              >
                + Añadir monto
              </button>
            )}
            {tipAmounts.length > 2 && (
              <button
                type="button"
                onClick={() => setTipAmounts(tipAmounts.slice(0, -1))}
                className="text-sm text-gray-400 cursor-pointer hover:underline"
              >
                − Quitar último
              </button>
            )}
          </div>
          <label className="flex items-center gap-3 cursor-pointer mb-5">
            <div
              className={`w-10 h-6 rounded-full transition-colors ${customAmountEnabled ? "bg-[#2ECC87]" : "bg-gray-200"}`}
              onClick={() => setCustomAmountEnabled(!customAmountEnabled)}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${customAmountEnabled ? "translate-x-4.5 ml-[18px]" : "ml-0.5"}`} />
            </div>
            <span className="text-sm text-[#0D1B1E] font-medium">Permitir monto personalizado</span>
          </label>
          <Button onClick={handleSaveAmounts} loading={savingAmounts}>
            {savedAmounts ? "Guardado ✓" : "Guardar montos"}
          </Button>
        </Card>

        {/* Thank-you message */}
        <Card>
          <h3 className="text-lg font-bold text-[#0D1B1E] mb-1">Mensaje de agradecimiento</h3>
          <p className="text-sm text-gray-500 mb-5">
            Texto que ve el cliente al completar su propina
          </p>
          <textarea
            value={thankYouMessage}
            onChange={(e) => setThankYouMessage(e.target.value.slice(0, 300))}
            placeholder="¡Gracias por tu propina! El equipo lo agradece mucho."
            className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-[#2ECC87] focus:outline-none resize-none"
            rows={3}
          />
          <p className="text-xs text-gray-400 mt-1 mb-4 text-right">{thankYouMessage.length}/300</p>
          <Button onClick={handleSaveMessage} loading={savingMessage}>
            {savedMessage ? "Guardado ✓" : "Guardar mensaje"}
          </Button>
        </Card>

        {/* Email notifications */}
        <Card>
          <h3 className="text-lg font-bold text-[#0D1B1E] mb-1">Notificaciones por email</h3>
          <p className="text-sm text-gray-500 mb-5">
            Recibe un email cada vez que llegue una nueva propina
          </p>
          <label className="flex items-center gap-3 cursor-pointer mb-5">
            <div
              className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${emailNotifications ? "bg-[#2ECC87]" : "bg-gray-200"}`}
              onClick={() => setEmailNotifications(!emailNotifications)}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${emailNotifications ? "ml-[18px]" : "ml-0.5"}`} />
            </div>
            <span className="text-sm text-[#0D1B1E] font-medium">
              {emailNotifications ? "Activadas" : "Desactivadas"}
            </span>
          </label>
          {emailNotifications && (
            <div className="mb-5">
              <Input
                label="Email de notificaciones (opcional)"
                type="email"
                placeholder="otro@email.com"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Si lo dejas vacío, se usará el email de tu cuenta
              </p>
            </div>
          )}
          <Button onClick={handleSaveEmail} loading={savingEmail}>
            {savedEmail ? "Guardado ✓" : "Guardar notificaciones"}
          </Button>
        </Card>

        {/* QR imprimible */}
        <Card>
          <h3 className="text-lg font-bold text-[#0D1B1E] mb-1">QR imprimible</h3>
          <p className="text-sm text-gray-500 mb-5">
            Genera un QR listo para imprimir y poner en tus mesas
          </p>
          <a
            href="/dashboard/qr-print"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 py-3 px-6 bg-[#0D1B1E] text-white text-sm font-bold rounded-[14px] hover:bg-[#1A3C34] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Abrir QR para imprimir
          </a>
        </Card>

        {/* Exportar CSV */}
        <Card>
          <h3 className="text-lg font-bold text-[#0D1B1E] mb-1">Exportar datos</h3>
          <p className="text-sm text-gray-500 mb-5">
            Descarga un CSV con el historial completo de propinas y repartos
          </p>
          <div className="flex gap-3 flex-wrap">
            <a
              href="/api/export/tips"
              download
              className="inline-flex items-center gap-2 py-3 px-5 bg-[#F5FAF7] text-[#0D1B1E] text-sm font-semibold rounded-[14px] hover:bg-[#E8F5E9] transition-colors border border-gray-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Propinas (CSV)
            </a>
            <a
              href="/api/export/distributions"
              download
              className="inline-flex items-center gap-2 py-3 px-5 bg-[#F5FAF7] text-[#0D1B1E] text-sm font-semibold rounded-[14px] hover:bg-[#E8F5E9] transition-colors border border-gray-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Repartos (CSV)
            </a>
          </div>
        </Card>

        {/* Stripe Connect */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#0D1B1E]">Cuenta de pagos</h3>
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
                Conecta tu cuenta bancaria para recibir las propinas. Se pedirá verificar tu identidad.
              </p>
              <Button onClick={handleConnectStripe} loading={connectingStripe}>
                <span className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect width="20" height="20" rx="4" fill="#635BFF" />
                    <path d="M9.3 8.3c0-.5.4-.7 1-.7.9 0 2 .3 2.9.8V6c-1-.4-1.9-.5-2.9-.5-2.4 0-3.9 1.2-3.9 3.3 0 3.2 4.4 2.7 4.4 4.1 0 .6-.5.8-1.2.8-1 0-2.3-.4-3.3-1v2.5c1.1.5 2.2.7 3.3.7 2.4 0 4.1-1.2 4.1-3.3 0-3.5-4.4-2.9-4.4-4.3z" fill="white" />
                  </svg>
                  Conectar cuenta bancaria
                </span>
              </Button>
            </>
          )}
        </Card>

        {/* Google Maps review */}
        <Card>
          <h3 className="text-lg font-bold text-[#0D1B1E] mb-1">Reseña en Google</h3>
          <p className="text-sm text-gray-500 mb-5">
            Tras cada propina, se mostrará un botón para que el cliente te deje una reseña en Google.
          </p>
          <Input
            label="URL de reseña de Google"
            type="url"
            placeholder="https://g.page/r/TuNegocio/review"
            value={googleMapsUrl}
            onChange={(e) => setGoogleMapsUrl(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-2 mb-4">
            En Google Business Profile → Inicio → &quot;Obtener más opiniones&quot; → copia el enlace corto
          </p>
          <Button onClick={handleSaveMaps} loading={savingMaps}>
            {savedMaps ? "Guardado ✓" : "Guardar enlace"}
          </Button>
        </Card>

        {/* Danger zone */}
        <Card className="border-2 border-red-200">
          <h3 className="text-lg font-bold text-red-600 mb-2">Zona peligrosa</h3>
          <p className="text-sm text-gray-500 mb-5">
            Al eliminar el restaurante se archivará el local y se desactivará el acceso del equipo. Los datos financieros se conservan por auditoría.
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
                  onClick={() => { setShowDeleteConfirm(false); setConfirmText(""); }}
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
