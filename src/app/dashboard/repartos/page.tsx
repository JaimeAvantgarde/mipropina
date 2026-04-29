"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCents, getRelativeTime } from "@/lib/utils";

type Distribution = {
  id: string;
  restaurant_id: string;
  week_start: string;
  week_end: string;
  total_cents: number;
  method: string;
  status: string;
  created_at: string;
};

type Payout = {
  id: string;
  distribution_id: string;
  staff_id: string;
  amount_cents: number;
  status: string;
  paid_at: string | null;
  staff_name?: string;
};

export default function RepartosPage() {
  const { data, loading } = useDashboard();
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const restaurantId = data?.restaurant?.id;

  useEffect(() => {
    if (!restaurantId) return;

    async function fetchDistributions() {
      try {
        const res = await fetch(`/api/distributions?restaurant_id=${restaurantId}`);
        if (res.ok) {
          const json = await res.json();
          setDistributions(json.distributions || []);
          setPayouts(json.payouts || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoadingData(false);
      }
    }
    fetchDistributions();
  }, [restaurantId]);

  if (loading || loadingData) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-9 bg-gray-200 rounded w-64 animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 rounded w-80 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-48 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const staffMap = new Map(data?.staff?.map((s) => [s.id, s]) || []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-[family-name:var(--font-serif)] text-[#0D1B1E]">
          Historial de repartos
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Todos los repartos de propinas realizados
        </p>
      </div>

      {distributions.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <div className="text-4xl mb-3 opacity-40">📋</div>
            <p className="text-gray-500 font-medium">No hay repartos todavía</p>
            <p className="text-sm text-gray-400 mt-1">
              Cuando repartas propinas desde la vista general, aparecerán aquí
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {distributions.map((dist) => {
            const distPayouts = payouts.filter((p) => p.distribution_id === dist.id);
            const isExpanded = expandedId === dist.id;
            const sentCount = distPayouts.filter((p) => p.status === "sent").length;
            const totalCount = distPayouts.length;

            return (
              <div key={dist.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : dist.id)}
                  className="w-full px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#2ECC87]/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-[#2ECC87]">
                        {formatCents(dist.total_cents).replace(" €", "")}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#0D1B1E]">
                        {formatCents(dist.total_cents)} repartidos
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {getRelativeTime(dist.created_at)} · {dist.method === "equal" ? "Equitativo" : "Por porcentaje"} · {totalCount} persona{totalCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={dist.status === "distributed" ? "active" : "pending"}>
                      {dist.status === "distributed" ? "Completado" : "Pendiente"}
                    </Badge>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && distPayouts.length > 0 && (
                  <div className="border-t border-gray-100 px-6 py-4">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          <th className="pb-3">Persona</th>
                          <th className="pb-3 text-right">Importe</th>
                          <th className="pb-3 text-right">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {distPayouts.map((p) => {
                          const staff = staffMap.get(p.staff_id);
                          return (
                            <tr key={p.id} className="border-t border-gray-50">
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{staff?.avatar_emoji || "👤"}</span>
                                  <span className="text-sm font-medium text-[#0D1B1E]">
                                    {staff?.name || "Desconocido"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 text-right text-sm font-bold text-[#0D1B1E]">
                                {formatCents(p.amount_cents)}
                              </td>
                              <td className="py-3 text-right">
                                <Badge
                                  variant={
                                    p.status === "sent" ? "active" :
                                    p.status === "failed" ? "error" : "pending"
                                  }
                                >
                                  {p.status === "sent" ? "Enviado" :
                                   p.status === "failed" ? "Fallido" : "Pendiente"}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {sentCount > 0 && sentCount < totalCount && (
                      <p className="text-xs text-gray-400 mt-3 text-center">
                        {sentCount} transferencia{sentCount !== 1 ? "s" : ""} Stripe · {totalCount - sentCount} pago{totalCount - sentCount !== 1 ? "s" : ""} manual{totalCount - sentCount !== 1 ? "es" : ""}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
