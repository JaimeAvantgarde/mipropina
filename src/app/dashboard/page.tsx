"use client";

import { useState } from "react";
import { formatCents } from "@/lib/utils";
import { useDashboard } from "@/lib/dashboard-context";
import { StatCard } from "@/components/dashboard/stat-card";
import { TipHistory } from "@/components/dashboard/tip-history";
import { TipChart } from "@/components/dashboard/tip-chart";
import { DistributeModal } from "@/components/dashboard/distribute-modal";
import { QRCard } from "@/components/dashboard/qr-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-2/3" />
    </div>
  );
}

export default function DashboardPage() {
  const [distributeOpen, setDistributeOpen] = useState(false);
  const { data, loading } = useDashboard();

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="h-9 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-12 bg-gray-200 rounded w-40 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse mb-8">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
          <div className="space-y-3">
            <div className="h-10 bg-gray-100 rounded" />
            <div className="h-10 bg-gray-100 rounded" />
            <div className="h-10 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { restaurant, tips, staff, stats, currentUserRole } = data;
  const isOwner = currentUserRole === "owner";
  const activeStaff = staff.filter((s) => s.active);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-[family-name:var(--font-serif)] text-[#0D1B1E]">
          Vista general
        </h1>
        {isOwner && (
          <Button onClick={() => setDistributeOpen(true)} size="lg">
            Repartir propinas
          </Button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Propinas recibidas"
          value={formatCents(stats.totalCents)}
          subtitle={stats.totalFeeCents > 0 ? `Neto a repartir: ${formatCents(stats.netCents)}` : "Propinas completadas sin repartir"}
        />
        <StatCard
          label="Propinas esta semana"
          value={`${stats.tipsThisWeek}`}
          subtitle="Total recibidas"
        />
        <StatCard
          label="Equipo activo"
          value={`${stats.activeStaff}`}
          subtitle={`${stats.activeStaff} personas`}
        />
        <StatCard
          label="Media por propina"
          value={formatCents(stats.avgCents)}
          subtitle="Propinas completadas"
        />
      </div>

      {/* Tip chart */}
      <div className="mb-8">
        <TipChart tips={tips} />
      </div>

      {/* Tip history */}
      <div className="mb-8">
        <TipHistory tips={tips} />
      </div>

      {/* QR Code */}
      <div className="mb-8">
        <QRCard slug={restaurant.slug} restaurantName={restaurant.name} />
      </div>

      {/* Quick team overview */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#0D1B1E] mb-4">Equipo</h3>
        {staff.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {staff.map((s) => (
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
        ) : (
          <p className="text-sm text-gray-400">No hay miembros en el equipo</p>
        )}
      </div>

      {/* Distribute modal */}
      <DistributeModal
        open={distributeOpen}
        onClose={() => setDistributeOpen(false)}
        totalCents={stats.netCents ?? stats.totalCents}
        staff={activeStaff}
        restaurantId={restaurant.id}
      />
    </div>
  );
}
