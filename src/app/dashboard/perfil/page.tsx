"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/utils";
import { useDashboard } from "@/lib/dashboard-context";
import type { Staff } from "@/lib/types";

export default function PerfilPage() {
  const { data, loading: dashLoading } = useDashboard();

  const [iban, setIban] = useState("");
  const [titular, setTitular] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [stripeStatus, setStripeStatus] = useState<{
    charges_enabled: boolean;
    payouts_enabled: boolean;
    details_submitted: boolean;
  } | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeConnecting, setStripeConnecting] = useState(false);

  // Find current user's staff record by their ID (not staff[0] which is always the owner)
  const currentStaff: Staff | null =
    data?.staff?.find((s) => s.id === data.currentUserStaffId) ?? null;

  const fetchStripeStatus = useCallback(async (payoutId: string) => {
    setStripeLoading(true);
    try {
      const res = await fetch(`/api/stripe/connect/status?account_id=${payoutId}`);
      if (res.ok) {
        const json = await res.json();
        setStripeStatus(json);
      }
    } catch {
      // silently fail
    } finally {
      setStripeLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentStaff) {
      setIban(currentStaff.iban || "");
      setEmail(currentStaff.email || "");
      setTitular(currentStaff.name || "");
      if (currentStaff.stripe_payout_id) {
        fetchStripeStatus(currentStaff.stripe_payout_id);
      }
    }
  }, [currentStaff, fetchStripeStatus]);

  // Calculate tip stats
  const completedTips = (data?.tips || []).filter((t) => t.status === "completed");
  const totalCents = completedTips.reduce((sum, t) => sum + t.amount_cents, 0);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekCents = completedTips
    .filter((t) => new Date(t.created_at) >= weekStart)
    .reduce((sum, t) => sum + t.amount_cents, 0);

  async function handleStripeConnect() {
    if (!currentStaff) return;
    setStripeConnecting(true);
    try {
      const res = await fetch("/api/stripe/connect/create-waiter-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff_id: currentStaff.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al conectar Stripe");
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al conectar con Stripe");
      setStripeConnecting(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!currentStaff) return;
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const res = await fetch("/api/staff/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentStaff.id,
          iban: iban.trim() || null,
          email: email.trim(),
          name: titular.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar los datos");
    } finally {
      setSaving(false);
    }
  }

  if (dashLoading) {
    return (
      <div>
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 animate-pulse" />
          <div className="h-7 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!currentStaff) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontró tu perfil.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-[#2ECC87]/10 rounded-full flex items-center justify-center text-5xl mb-4">
          {currentStaff.avatar_emoji}
        </div>
        <h2 className="text-2xl font-bold text-[#0D1B1E]">{currentStaff.name}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {data?.restaurant?.name || ""}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="text-center">
          <p className="text-sm text-gray-500 mb-1">Propinas esta semana</p>
          <p className="text-2xl font-bold text-[#0D1B1E]">{formatCents(weekCents)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500 mb-1">Total acumulado</p>
          <p className="text-2xl font-bold text-[#0D1B1E]">{formatCents(totalCents)}</p>
        </Card>
      </div>

      {/* Payment data form */}
      <Card>
        <h3 className="text-lg font-bold text-[#0D1B1E] mb-5">Datos de pago</h3>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="IBAN"
            placeholder="ES00 0000 0000 0000 0000 0000"
            value={iban}
            onChange={(e) => setIban(e.target.value.toUpperCase())}
          />
          <Input
            label="Nombre del titular"
            placeholder="Nombre y apellidos"
            value={titular}
            onChange={(e) => setTitular(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm font-semibold">
              {error}
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 bg-[#2ECC87]/10 text-[#2ECC87] rounded-xl px-4 py-3 text-sm font-semibold">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Datos guardados correctamente
            </div>
          )}

          <Button type="submit" size="lg" loading={saving} className="w-full mt-2">
            Guardar datos
          </Button>
        </form>
      </Card>

      {/* Stripe Connect section */}
      <Card className="mt-6">
        <h3 className="text-lg font-bold text-[#0D1B1E] mb-4">Cuenta Stripe Connect</h3>

        {currentStaff.stripe_payout_id ? (
          <div className="flex flex-col gap-3">
            <Badge variant="active">Cuenta Stripe conectada</Badge>

            {stripeLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-40" />
              </div>
            ) : stripeStatus ? (
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${stripeStatus.charges_enabled ? "bg-green-500" : "bg-orange-400"}`} />
                  <span className="text-gray-600">
                    Cobros: {stripeStatus.charges_enabled ? "Habilitados" : "Pendiente"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${stripeStatus.payouts_enabled ? "bg-green-500" : "bg-orange-400"}`} />
                  <span className="text-gray-600">
                    Pagos: {stripeStatus.payouts_enabled ? "Habilitados" : "Pendiente"}
                  </span>
                </div>
                {!stripeStatus.details_submitted && (
                  <Button size="sm" className="w-fit mt-2" onClick={handleStripeConnect} loading={stripeConnecting}>
                    Completar configuración
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500">
              Conecta tu cuenta bancaria para recibir propinas automáticamente a través de Stripe.
            </p>
            <Button onClick={handleStripeConnect} loading={stripeConnecting} className="w-full">
              Conectar con Stripe
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
