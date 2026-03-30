"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCents } from "@/lib/utils";

type RestaurantMetric = {
  id: string;
  name: string;
  slug: string;
  logo_emoji: string;
  logo_url: string | null;
  stripe_account_id: string | null;
  created_at: string;
  tips_count: number;
  total_tips_cents: number;
  total_fees_cents: number;
  net_cents: number;
  distributed_cents: number;
  available_cents: number;
  staff_count: number;
  total_staff: number;
};

type GlobalStats = {
  total_tips_cents: number;
  total_platform_fees_cents: number;
  total_client_fees_cents: number;
  total_revenue_cents: number;
  restaurants_count: number;
  active_staff_count: number;
  total_tips_count: number;
};

type AdminData = {
  globalStats: GlobalStats;
  restaurants: RestaurantMetric[];
};

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/data")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar datos");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded mb-2" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        {error || "Error desconocido"}
      </div>
    );
  }

  const { globalStats, restaurants } = data;

  return (
    <div className="space-y-8">
      {/* Global Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total propinas"
          value={formatCents(globalStats.total_tips_cents)}
          sub={`${globalStats.total_tips_count} propinas`}
        />
        <StatCard
          label="Ingresos plataforma"
          value={formatCents(globalStats.total_revenue_cents)}
          sub={`Fees: ${formatCents(globalStats.total_platform_fees_cents)} + Servicio: ${formatCents(globalStats.total_client_fees_cents)}`}
        />
        <StatCard
          label="Restaurantes"
          value={String(globalStats.restaurants_count)}
        />
        <StatCard
          label="Staff activo"
          value={String(globalStats.active_staff_count)}
        />
      </div>

      {/* Restaurants Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Restaurantes</h2>
        </div>

        {restaurants.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No hay restaurantes registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 font-medium">
                  <th className="px-6 py-3">Bar</th>
                  <th className="px-4 py-3 text-right">Propinas</th>
                  <th className="px-4 py-3 text-right hidden md:table-cell">
                    Fees
                  </th>
                  <th className="px-4 py-3 text-right">Neto</th>
                  <th className="px-4 py-3 text-right hidden lg:table-cell">
                    Repartido
                  </th>
                  <th className="px-4 py-3 text-right">Disponible</th>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">
                    Staff
                  </th>
                  <th className="px-4 py-3 text-center hidden lg:table-cell">
                    Stripe
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {restaurants.map((r) => (
                  <Link
                    key={r.id}
                    href={`/admin/${r.slug}`}
                    className="contents"
                  >
                    <tr className="hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{r.logo_emoji}</span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {r.name}
                            </p>
                            <p className="text-xs text-gray-400">/{r.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-medium">
                        {formatCents(r.total_tips_cents)}
                        <span className="text-gray-400 text-xs ml-1">
                          ({r.tips_count})
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-gray-500 hidden md:table-cell">
                        {formatCents(r.total_fees_cents)}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-emerald-600">
                        {formatCents(r.net_cents)}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-500 hidden lg:table-cell">
                        {formatCents(r.distributed_cents)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span
                          className={
                            r.available_cents > 0
                              ? "font-medium text-blue-600"
                              : "text-gray-400"
                          }
                        >
                          {formatCents(r.available_cents)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center hidden sm:table-cell">
                        <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 rounded-full w-7 h-7 text-xs font-medium">
                          {r.staff_count}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center hidden lg:table-cell">
                        {r.stripe_account_id ? (
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" title="Conectado" />
                        ) : (
                          <span className="inline-block w-2 h-2 rounded-full bg-gray-300" title="Sin conectar" />
                        )}
                      </td>
                    </tr>
                  </Link>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
