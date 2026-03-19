"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/utils";
import Link from "next/link";
import type { Staff, Restaurant } from "@/lib/types";

// Mock profile data for fallback
const mockProfile = {
  name: "Carlos Martinez",
  email: "carlos@email.com",
  phone: "+34 612 345 678",
  avatar_emoji: "👨‍🍳",
  restaurant: "Tu restaurante",
  iban: "",
  titular: "",
  tips_week_cents: 0,
  tips_total_cents: 0,
};

type ProfileData = {
  staff: Staff;
  restaurant: Restaurant;
  tips_week_cents: number;
  tips_total_cents: number;
};

export default function PerfilPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [iban, setIban] = useState(mockProfile.iban);
  const [titular, setTitular] = useState(mockProfile.titular);
  const [email, setEmail] = useState(mockProfile.email);
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

  const fetchStripeStatus = useCallback(async (payoutId: string) => {
    setStripeLoading(true);
    try {
      const res = await fetch(
        `/api/stripe/connect/status?account_id=${payoutId}`
      );
      if (res.ok) {
        const data = await res.json();
        setStripeStatus(data);
      }
    } catch {
      console.warn("[perfil] Error al obtener estado de Stripe");
    } finally {
      setStripeLoading(false);
    }
  }, []);

  async function handleStripeConnect() {
    if (!profile?.staff) return;
    setStripeConnecting(true);
    try {
      const res = await fetch("/api/stripe/connect/create-waiter-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff_id: profile.staff.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al conectar Stripe");
      // Redirect to Stripe onboarding
      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al conectar con Stripe"
      );
      setStripeConnecting(false);
    }
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/dashboard/data");
        if (!res.ok) throw new Error("Error");
        const data = await res.json();

        // Find the current user's staff record (for now, use the first one or owner)
        const staffRecord = data.staff?.[0];
        if (staffRecord && data.restaurant) {
          // Calculate tip stats for this staff member
          const tipsWeek = 0; // TODO: fetch payouts for this staff
          const tipsTotal = 0;

          const profileData: ProfileData = {
            staff: staffRecord,
            restaurant: data.restaurant,
            tips_week_cents: tipsWeek,
            tips_total_cents: tipsTotal,
          };
          setProfile(profileData);
          setIban(staffRecord.iban || "");
          setEmail(staffRecord.email || "");
          setTitular(staffRecord.name || "");

          // Fetch Stripe status if connected
          if (staffRecord.stripe_payout_id) {
            fetchStripeStatus(staffRecord.stripe_payout_id);
          }
        }
      } catch {
        // Use mock data as fallback
        console.warn("[perfil] Usando datos de prueba");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [fetchStripeStatus]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      if (profile?.staff) {
        const res = await fetch("/api/staff/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: profile.staff.id,
            iban: iban.trim() || null,
            email: email.trim(),
            name: titular.trim(),
          }),
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Error al guardar");
        }
      } else {
        // Fallback mock save
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar los datos");
    } finally {
      setSaving(false);
    }
  }

  const displayName = profile?.staff?.name || mockProfile.name;
  const displayEmoji = profile?.staff?.avatar_emoji || mockProfile.avatar_emoji;
  const displayRestaurant = profile?.restaurant?.name || mockProfile.restaurant;
  const displayTipsWeek = profile?.tips_week_cents ?? mockProfile.tips_week_cents;
  const displayTipsTotal = profile?.tips_total_cents ?? mockProfile.tips_total_cents;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <h1 className="text-xl font-serif text-dark tracking-tight">
              mipropina
            </h1>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {loading ? (
          <div className="animate-pulse">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 bg-gray-200 rounded-full mb-4" />
              <div className="h-7 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Avatar + Name */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-5xl mb-4">
                {displayEmoji}
              </div>
              <h2 className="text-2xl font-bold text-dark">{displayName}</h2>
              <p className="text-sm text-foreground/60 mt-1">
                {displayRestaurant}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card className="text-center">
                <p className="text-sm text-foreground/60 mb-1">
                  Propinas esta semana
                </p>
                <p className="text-2xl font-bold text-dark">
                  {formatCents(displayTipsWeek)}
                </p>
              </Card>
              <Card className="text-center">
                <p className="text-sm text-foreground/60 mb-1">Total acumulado</p>
                <p className="text-2xl font-bold text-dark">
                  {formatCents(displayTipsTotal)}
                </p>
              </Card>
            </div>

            {/* Payment data form */}
            <Card>
              <h3 className="text-lg font-bold text-dark mb-5">Datos de pago</h3>

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

                {/* Error message */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm font-semibold">
                    {error}
                  </div>
                )}

                {/* Success message */}
                {saved && (
                  <div className="flex items-center gap-2 bg-primary/10 text-primary rounded-xl px-4 py-3 text-sm font-semibold">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    Datos guardados correctamente
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  loading={saving}
                  className="w-full mt-2"
                >
                  Guardar datos
                </Button>
              </form>
            </Card>

            {/* Stripe Connect section */}
            <Card className="mt-6">
              <h3 className="text-lg font-bold text-dark mb-4">
                Cuenta Stripe Connect
              </h3>

              {profile?.staff?.stripe_payout_id ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="active">Cuenta Stripe conectada</Badge>
                  </div>

                  {stripeLoading ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-40" />
                    </div>
                  ) : stripeStatus ? (
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            stripeStatus.charges_enabled
                              ? "bg-green-500"
                              : "bg-orange-400"
                          }`}
                        />
                        <span className="text-foreground/70">
                          Cobros:{" "}
                          {stripeStatus.charges_enabled
                            ? "Habilitados"
                            : "Pendiente"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            stripeStatus.payouts_enabled
                              ? "bg-green-500"
                              : "bg-orange-400"
                          }`}
                        />
                        <span className="text-foreground/70">
                          Pagos:{" "}
                          {stripeStatus.payouts_enabled
                            ? "Habilitados"
                            : "Pendiente"}
                        </span>
                      </div>

                      {!stripeStatus.details_submitted && (
                        <Button
                          size="sm"
                          className="w-fit mt-2"
                          onClick={handleStripeConnect}
                          loading={stripeConnecting}
                        >
                          Completar configuracion
                        </Button>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-foreground/60">
                    Conecta tu cuenta bancaria para recibir propinas
                    automaticamente a traves de Stripe.
                  </p>
                  <Button
                    onClick={handleStripeConnect}
                    loading={stripeConnecting}
                    className="w-full"
                  >
                    Conectar con Stripe
                  </Button>
                </div>
              )}
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
