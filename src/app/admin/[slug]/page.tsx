"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatCents, getRelativeTime } from "@/lib/utils";
import type { Restaurant, Tip, Distribution, Payout } from "@/lib/types";

type StaffInfo = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: "manager" | "waiter" | "kitchen";
  avatar_emoji: string;
  active: boolean;
  status: "active" | "pending" | "inactive";
  stripe_payout_id: string | null;
  created_at: string;
};

type DistributionWithPayouts = Distribution & { payouts: Payout[] };

type PendingInvite = {
  id: string;
  token: string;
  name: string;
  phone: string;
  expires_at: string;
  whatsapp_url: string;
};

type RestaurantDetail = {
  restaurant: Restaurant;
  staff: StaffInfo[];
  tips: Tip[];
  distributions: DistributionWithPayouts[];
  stats: {
    total_tips_cents: number;
    total_fees_cents: number;
    net_cents: number;
    distributed_cents: number;
    available_cents: number;
    tips_count: number;
  };
  pending_manager_invite: PendingInvite | null;
};

const ROLE_LABEL: Record<StaffInfo["role"], string> = {
  manager: "Gerente",
  waiter: "Camarero",
  kitchen: "Cocina",
};

const ROLE_STYLE: Record<StaffInfo["role"], string> = {
  manager: "bg-purple-100 text-purple-700",
  waiter: "bg-gray-100 text-gray-600",
  kitchen: "bg-orange-100 text-orange-700",
};

const STATUS_LABEL: Record<StaffInfo["status"], string> = {
  active: "Activo",
  pending: "Pendiente",
  inactive: "Inactivo",
};

const STATUS_STYLE: Record<StaffInfo["status"], string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  inactive: "bg-red-100 text-red-700",
};

export default function AdminRestaurantPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/restaurant/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar datos");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    reload();
  }, [reload]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Volver
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          {error || "Restaurante no encontrado"}
        </div>
      </div>
    );
  }

  const { restaurant, staff, tips, distributions, stats, pending_manager_invite } = data;
  const manager = staff.find((s) => s.id === restaurant.manager_id && s.status === "active");

  async function handleEject() {
    if (!confirm("¿Seguro? El gerente perderá acceso. Su equipo quedará pendiente.")) {
      return;
    }
    const res = await fetch(`/api/admin/restaurant/${slug}/eject-manager`, {
      method: "POST",
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Error al expulsar.");
      return;
    }
    reload();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
        >
          &larr; Volver a restaurantes
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{restaurant.logo_emoji}</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {restaurant.name}
            </h2>
            <p className="text-sm text-gray-500">
              /{restaurant.slug} &middot; Creado{" "}
              {new Date(restaurant.created_at).toLocaleDateString("es-ES")}
              {restaurant.stripe_account_id && (
                <span className="ml-2 inline-flex items-center gap-1 text-emerald-600">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                  Stripe conectado
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Manager section */}
      <Section title="Gerente">
        {manager ? (
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{manager.avatar_emoji}</span>
              <div>
                <p className="font-medium text-gray-900">{manager.name}</p>
                <p className="text-sm text-gray-500">{manager.phone}</p>
                {manager.email && (
                  <p className="text-xs text-gray-400">{manager.email}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleEject}
              className="self-start sm:self-auto bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium px-4 py-2 rounded-lg border border-red-200 transition-colors"
            >
              Expulsar gerente
            </button>
          </div>
        ) : pending_manager_invite ? (
          <PendingInviteCard
            invite={pending_manager_invite}
            slug={slug}
            onChanged={reload}
          />
        ) : (
          <div className="p-6">
            {!showInviteForm ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-gray-600">
                  Este restaurante no tiene gerente.
                </p>
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
                >
                  Invitar gerente
                </button>
              </div>
            ) : (
              <InviteManagerForm
                slug={slug}
                onCancel={() => setShowInviteForm(false)}
                onSuccess={() => {
                  setShowInviteForm(false);
                  reload();
                }}
              />
            )}
          </div>
        )}
      </Section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Propinas (neto)"
          value={formatCents(stats.net_cents)}
          sub={`${stats.tips_count} propinas | Bruto: ${formatCents(stats.total_tips_cents)}`}
        />
        <StatCard
          label="Repartido"
          value={formatCents(stats.distributed_cents)}
          sub={`${distributions.filter((d) => d.status === "distributed").length} repartos`}
        />
        <StatCard
          label="Disponible para repartir"
          value={formatCents(stats.available_cents)}
          highlight={stats.available_cents > 0}
        />
      </div>

      {/* Staff */}
      <Section title={`Equipo (${staff.length})`}>
        {staff.length === 0 ? (
          <EmptyState text="Sin miembros de equipo." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 font-medium">
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-4 py-3 hidden md:table-cell">Teléfono</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3 text-center">Rol</th>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">
                    Stripe
                  </th>
                  <th className="px-4 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.map((s) => (
                  <tr key={s.id}>
                    <td className="px-6 py-3">
                      <span className="mr-2">{s.avatar_emoji}</span>
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {s.phone}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {s.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${ROLE_STYLE[s.role]}`}
                      >
                        {ROLE_LABEL[s.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      {s.stripe_payout_id ? (
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" title="Conectado" />
                      ) : (
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-300" title="Sin conectar" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[s.status]}`}
                      >
                        {STATUS_LABEL[s.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Tips */}
      <Section title={`Últimas propinas (${tips.length})`}>
        {tips.length === 0 ? (
          <EmptyState text="Sin propinas registradas." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 font-medium">
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Importe</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">
                    Fee
                  </th>
                  <th className="px-4 py-3 text-right">Neto</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tips.map((t) => (
                  <tr key={t.id}>
                    <td className="px-6 py-3 text-gray-600">
                      {new Date(t.created_at).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                      })}{" "}
                      <span className="text-gray-400">
                        {new Date(t.created_at).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCents(t.amount_cents)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 hidden sm:table-cell">
                      {formatCents(t.platform_fee_cents)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">
                      {formatCents(t.amount_cents - t.platform_fee_cents)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <TipStatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Distributions */}
      <Section title={`Repartos (${distributions.length})`}>
        {distributions.length === 0 ? (
          <EmptyState text="Sin repartos realizados." />
        ) : (
          <div className="space-y-3 p-4">
            {distributions.map((d) => (
              <div
                key={d.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-gray-900">
                      {formatCents(d.total_cents)}
                    </span>
                    <span className="text-gray-400 text-sm ml-2">
                      {d.method} &middot;{" "}
                      {getRelativeTime(d.created_at)}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      d.status === "distributed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {d.status === "distributed" ? "Repartido" : "Pendiente"}
                  </span>
                </div>
                {d.payouts.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {d.payouts.map((p) => {
                      const staffMember = staff.find((s) => s.id === p.staff_id);
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-sm text-gray-600 pl-4"
                        >
                          <span>
                            {staffMember?.avatar_emoji}{" "}
                            {staffMember?.name || "Desconocido"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {formatCents(p.amount_cents)}
                            </span>
                            <PayoutStatusDot status={p.status} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function InviteManagerForm({
  slug,
  onCancel,
  onSuccess,
}: {
  slug: string;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/restaurant/${slug}/invite-manager`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Error.");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nombre del gerente
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Pepe García"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Teléfono (WhatsApp)
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="+34 635 41 50 49"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg"
        >
          {loading ? "Generando…" : "Generar enlace"}
        </button>
      </div>
    </form>
  );
}

function PendingInviteCard({
  invite,
  slug,
  onChanged,
}: {
  invite: PendingInvite;
  slug: string;
  onChanged: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const expires = new Date(invite.expires_at);
  const expiresStr = expires.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  async function cancelInvite() {
    if (!confirm("¿Cancelar esta invitación?")) return;
    const res = await fetch(`/api/admin/restaurant/${slug}/eject-manager`, {
      method: "POST",
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Error.");
      return;
    }
    onChanged();
  }

  return (
    <div className="p-6 space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="font-medium text-amber-900">Invitación pendiente</p>
        <p className="text-sm text-amber-800 mt-1">
          {invite.name} &middot; {invite.phone}
        </p>
        <p className="text-xs text-amber-700 mt-1">Caduca el {expiresStr}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <a
          href={invite.whatsapp_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-lg"
        >
          Abrir WhatsApp
        </a>
        <button
          onClick={() => {
            const base = window.location.origin;
            navigator.clipboard.writeText(`${base}/i/${invite.token}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          {copied ? "¡Copiado!" : "Copiar enlace"}
        </button>
        <button
          onClick={cancelInvite}
          className="px-4 py-2.5 border border-red-200 rounded-lg text-red-700 hover:bg-red-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p
        className={`text-2xl font-bold ${
          highlight ? "text-blue-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-6 py-12 text-center text-gray-400">{text}</div>
  );
}

function TipStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-gray-100 text-gray-600",
  };
  const labels: Record<string, string> = {
    completed: "Completada",
    pending: "Pendiente",
    failed: "Fallida",
    refunded: "Reembolsada",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

function PayoutStatusDot({ status }: { status: string }) {
  const color =
    status === "sent"
      ? "bg-emerald-400"
      : status === "failed"
      ? "bg-red-400"
      : "bg-yellow-400";
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} title={status} />;
}
