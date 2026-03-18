"use client";

import { useState } from "react";
import type { Tip, Staff } from "@/lib/types";
import { formatCents } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { TipHistory } from "@/components/dashboard/tip-history";
import { DistributeModal } from "@/components/dashboard/distribute-modal";
import { QRCard } from "@/components/dashboard/qr-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockTips: Tip[] = [
  { id: "1", restaurant_id: "demo", amount_cents: 500, stripe_payment_id: "pi_1", status: "completed", customer_session: null, created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: "2", restaurant_id: "demo", amount_cents: 300, stripe_payment_id: "pi_2", status: "completed", customer_session: null, created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: "3", restaurant_id: "demo", amount_cents: 1000, stripe_payment_id: "pi_3", status: "completed", customer_session: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: "4", restaurant_id: "demo", amount_cents: 200, stripe_payment_id: "pi_4", status: "pending", customer_session: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: "5", restaurant_id: "demo", amount_cents: 2000, stripe_payment_id: "pi_5", status: "completed", customer_session: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

const mockStaff: Staff[] = [
  { id: "1", restaurant_id: "demo", name: "Carlos García", email: "carlos@test.com", phone: "+34612345678", avatar_emoji: "👨‍🍳", role: "owner", iban: "ES12 1234 5678 9012 3456 7890", stripe_payout_id: "acct_1", active: true, created_at: "2024-01-01" },
  { id: "2", restaurant_id: "demo", name: "María López", email: "maria@test.com", phone: "+34623456789", avatar_emoji: "👩‍🍳", role: "waiter", iban: "ES34 9876 5432 1098 7654 3210", stripe_payout_id: "acct_2", active: true, created_at: "2024-02-15" },
  { id: "3", restaurant_id: "demo", name: "Pedro Ruiz", email: "pedro@test.com", phone: "+34634567890", avatar_emoji: "🧑‍🍳", role: "waiter", iban: null, stripe_payout_id: null, active: true, created_at: "2024-03-01" },
];

export default function DashboardPage() {
  const [distributeOpen, setDistributeOpen] = useState(false);

  const completedTips = mockTips.filter((t) => t.status === "completed");
  const totalCents = completedTips.reduce((sum, t) => sum + t.amount_cents, 0);
  const avgCents = completedTips.length > 0 ? Math.round(totalCents / completedTips.length) : 0;
  const activeStaff = mockStaff.filter((s) => s.active);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-[family-name:var(--font-serif)] text-[#0D1B1E]">
          Vista general
        </h1>
        <Button onClick={() => setDistributeOpen(true)} size="lg">
          Repartir propinas
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Hucha acumulada"
          value={formatCents(totalCents)}
          trend={{ value: 12, positive: true }}
          subtitle="Propinas completadas sin repartir"
        />
        <StatCard
          label="Propinas esta semana"
          value={`${mockTips.length}`}
          trend={{ value: 8, positive: true }}
          subtitle="Total recibidas"
        />
        <StatCard
          label="Equipo activo"
          value={`${activeStaff.length}`}
          subtitle={`${activeStaff.length} personas`}
        />
        <StatCard
          label="Media por propina"
          value={formatCents(avgCents)}
          trend={{ value: 5, positive: true }}
          subtitle="Últimos 7 días"
        />
      </div>

      {/* Tip history */}
      <div className="mb-8">
        <TipHistory tips={mockTips} />
      </div>

      {/* QR Code */}
      <div className="mb-8">
        <QRCard slug="la-tasca-de-maria" restaurantName="La Tasca de María" />
      </div>

      {/* Quick team overview */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#0D1B1E] mb-4">Equipo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {mockStaff.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#F5FAF7]"
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">
                {s.avatar_emoji}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0D1B1E]">{s.name}</p>
                <Badge variant={s.role === "owner" ? "info" : "active"}>
                  {s.role === "owner" ? "Gerente" : "Camarero"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distribute modal */}
      <DistributeModal
        open={distributeOpen}
        onClose={() => setDistributeOpen(false)}
        totalCents={totalCents}
        staff={mockStaff}
      />
    </div>
  );
}
