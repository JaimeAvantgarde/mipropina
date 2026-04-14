"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { TeamList } from "@/components/dashboard/team-list";
import { InviteModal } from "@/components/dashboard/invite-modal";
import { Badge } from "@/components/ui/badge";
import { getRelativeTime } from "@/lib/utils";

export default function EquipoPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const { data, loading, refetch } = useDashboard();

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-9 bg-gray-200 rounded w-32 animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse mb-8">
          <div className="h-6 bg-gray-200 rounded w-24 mb-4" />
          <div className="space-y-4">
            <div className="h-16 bg-gray-100 rounded" />
            <div className="h-16 bg-gray-100 rounded" />
            <div className="h-16 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { restaurant, staff, pendingInvites, currentUserRole } = data;
  const isOwner = currentUserRole === "owner";

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-[family-name:var(--font-serif)] text-[#0D1B1E]">
          Equipo
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isOwner ? "Gestiona los miembros de tu equipo y envia invitaciones" : "Miembros del equipo"}
        </p>
      </div>

      {/* Team list */}
      <div className="mb-8">
        <TeamList staff={staff} onInvite={() => setInviteOpen(true)} onRefresh={refetch} readOnly={!isOwner} />
      </div>

      {/* Pending invites */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-[#0D1B1E]">
            Invitaciones pendientes
          </h3>
        </div>
        {pendingInvites.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {pendingInvites.map((inv) => (
              <div
                key={inv.id}
                className="px-4 sm:px-6 py-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-lg flex-shrink-0">
                    ✉️
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-[#0D1B1E] text-sm">
                        {inv.name}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="pending">Pendiente</Badge>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {getRelativeTime(inv.created_at)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {inv.phone}
                    </p>
                    <p className="text-xs text-gray-300 mt-0.5 font-mono truncate">
                      {inv.code}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No hay invitaciones pendientes
          </div>
        )}
      </div>

      {/* Invite modal */}
      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
      />
    </div>
  );
}
