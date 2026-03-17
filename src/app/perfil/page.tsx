"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatCents } from "@/lib/utils";
import Link from "next/link";

// Mock profile data
const mockProfile = {
  name: "Carlos Martínez",
  email: "carlos@email.com",
  phone: "+34 612 345 678",
  avatar_emoji: "👨‍🍳",
  restaurant: "La Tasca de María",
  iban: "ES12 3456 7890 1234 5678 9012",
  titular: "Carlos Martínez López",
  tips_week_cents: 4500,
  tips_total_cents: 32050,
};

export default function PerfilPage() {
  const [iban, setIban] = useState(mockProfile.iban);
  const [titular, setTitular] = useState(mockProfile.titular);
  const [email, setEmail] = useState(mockProfile.email);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      // TODO: Save to database
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // Handle error
    } finally {
      setSaving(false);
    }
  }

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
        {/* Avatar + Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-5xl mb-4">
            {mockProfile.avatar_emoji}
          </div>
          <h2 className="text-2xl font-bold text-dark">{mockProfile.name}</h2>
          <p className="text-sm text-foreground/60 mt-1">
            {mockProfile.restaurant}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="text-center">
            <p className="text-sm text-foreground/60 mb-1">
              Propinas esta semana
            </p>
            <p className="text-2xl font-bold text-dark">
              {formatCents(mockProfile.tips_week_cents)}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-foreground/60 mb-1">Total acumulado</p>
            <p className="text-2xl font-bold text-dark">
              {formatCents(mockProfile.tips_total_cents)}
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
      </main>
    </div>
  );
}
