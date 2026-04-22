"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCents } from "@/lib/utils";
import { useDashboard } from "@/lib/dashboard-context";
import { StatCard } from "@/components/dashboard/stat-card";
import { TipHistory } from "@/components/dashboard/tip-history";
import { TipChart } from "@/components/dashboard/tip-chart";
import { DistributeModal } from "@/components/dashboard/distribute-modal";
import { QRCard } from "@/components/dashboard/qr-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-2/3" />
    </div>
  );
}

// Icons as small SVG components
function CoinsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2ECC87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function AvgIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

export default function DashboardPage() {
  const [distributeOpen, setDistributeOpen] = useState(false);
  const { data, loading } = useDashboard();
  const router = useRouter();

  // Waiters have no business on the manager dashboard — send them to their profile
  useEffect(() => {
    if (!loading && data && data.currentUserRole === "waiter") {
      router.replace("/dashboard/perfil");
    }
  }, [loading, data, router]);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-9 bg-gray-200 rounded w-48 animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
          </div>
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
          <div className="h-36 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { restaurant, tips, staff, stats, currentUserRole } = data;
  const isOwner = currentUserRole === "owner";
  const activeStaff = staff.filter((s) => s.active);
  const hasTips = tips.length > 0;
  const hasStaff = staff.length > 1;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-[family-name:var(--font-serif)] text-[#0D1B1E]">
            Hola, {restaurant.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {hasTips
              ? `${stats.tipsThisWeek} propina${stats.tipsThisWeek !== 1 ? "s" : ""} esta semana`
              : "Tu panel de control de propinas"
            }
          </p>
        </div>
        {isOwner && stats.netCents > 0 && (
          <Button onClick={() => setDistributeOpen(true)} size="lg">
            <span className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Repartir {formatCents(stats.netCents)}
            </span>
          </Button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Disponible para repartir"
          value={formatCents(stats.netCents ?? 0)}
          subtitle={`${tips.filter(t => t.status === "completed").length} propina${tips.filter(t => t.status === "completed").length !== 1 ? "s" : ""} completada${tips.filter(t => t.status === "completed").length !== 1 ? "s" : ""}`}
          icon={<CoinsIcon />}
          accent="#2ECC87"
        />
        <StatCard
          label="Esta semana"
          value={formatCents(stats.tipsThisWeekCents ?? 0)}
          subtitle={`${stats.tipsThisWeek ?? 0} propina${(stats.tipsThisWeek ?? 0) !== 1 ? "s" : ""} recibida${(stats.tipsThisWeek ?? 0) !== 1 ? "s" : ""}`}
          icon={<CalendarIcon />}
          accent="#6366F1"
        />
        <StatCard
          label="Equipo"
          value={`${stats.activeStaff ?? 0}`}
          subtitle={`persona${(stats.activeStaff ?? 0) !== 1 ? "s" : ""} activa${(stats.activeStaff ?? 0) !== 1 ? "s" : ""}`}
          icon={<TeamIcon />}
          accent="#F59E0B"
        />
        <StatCard
          label="Media neta"
          value={formatCents(stats.avgCents ?? 0)}
          subtitle="Por propina"
          icon={<AvgIcon />}
          accent="#EC4899"
        />
      </div>

      {/* Chart + QR side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <TipChart tips={tips} />
        </div>
        <div>
          <QRCard slug={restaurant.slug} restaurantName={restaurant.name} />
        </div>
      </div>

      {/* Tip history */}
      <div className="mb-8">
        <TipHistory tips={tips} />
      </div>

      {/* Quick team overview */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#0D1B1E]">Equipo</h3>
          {isOwner && (
            <Link href="/dashboard/equipo" className="text-sm font-medium text-[#2ECC87] hover:underline">
              Gestionar
            </Link>
          )}
        </div>

        {staff.length > 0 ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {staff.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#F5FAF7] hover:bg-[#EDF7F1] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">
                  {s.avatar_emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0D1B1E] truncate">{s.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={s.role === "owner" ? "info" : "active"}>
                      {s.role === "owner" ? "Gerente" : "Camarero"}
                    </Badge>
                    {s.stripe_payout_id && (
                      <span className="text-[9px] font-semibold text-[#635BFF] bg-[#635BFF]/10 px-1.5 py-0.5 rounded">
                        Stripe
                      </span>
                    )}
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.active ? "bg-[#2ECC87]" : "bg-gray-300"}`} />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-400 text-sm mb-3">Tu equipo aparecerá aquí</p>
            {isOwner && (
              <Link href="/dashboard/equipo">
                <Button variant="secondary" size="sm">Invitar camareros</Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Onboarding checklist for new restaurants */}
      {isOwner && (!hasTips || !hasStaff || !restaurant.stripe_account_id) && (
        <div className="mt-8 bg-gradient-to-r from-[#0D1B1E] to-[#1a3530] rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-1">Primeros pasos</h3>
          <p className="text-white/60 text-sm mb-5">Completa estos pasos para empezar a recibir propinas</p>
          <div className="space-y-3">
            <ChecklistItem
              done={!!restaurant.stripe_account_id}
              label="Conecta tu cuenta bancaria"
              href="/dashboard/ajustes"
            />
            <ChecklistItem
              done={hasStaff}
              label="Invita a tu equipo"
              href="/dashboard/equipo"
            />
            <ChecklistItem
              done={!!restaurant.logo_url}
              label="Sube el logo de tu restaurante"
              href="/dashboard/ajustes"
            />
            <ChecklistItem
              done={hasTips}
              label="Recibe tu primera propina"
              description="Escanea el QR de arriba para probarlo"
            />
          </div>
        </div>
      )}

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

function ChecklistItem({ done, label, description, href }: {
  done: boolean;
  label: string;
  description?: string;
  href?: string;
}) {
  const content = (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
      done ? "bg-white/5" : "bg-white/10 hover:bg-white/15"
    }`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
        done ? "bg-[#2ECC87]" : "border-2 border-white/30"
      }`}>
        {done && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <div>
        <p className={`text-sm font-medium ${done ? "text-white/40 line-through" : "text-white"}`}>
          {label}
        </p>
        {description && !done && (
          <p className="text-xs text-white/40 mt-0.5">{description}</p>
        )}
      </div>
      {!done && href && (
        <svg className="w-4 h-4 text-white/40 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );

  if (href && !done) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
