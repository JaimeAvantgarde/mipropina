"use client";

import { useState } from "react";
import type { Staff, InviteCode } from "@/lib/types";
import { TeamList } from "@/components/dashboard/team-list";
import { InviteModal } from "@/components/dashboard/invite-modal";
import { Badge } from "@/components/ui/badge";
import { getRelativeTime } from "@/lib/utils";

const mockStaff: Staff[] = [
  { id: "1", restaurant_id: "demo", name: "Carlos García", email: "carlos@test.com", phone: "+34612345678", avatar_emoji: "👨‍🍳", role: "owner", iban: "ES12 1234 5678 9012 3456 7890", stripe_payout_id: "acct_1", active: true, created_at: "2024-01-01" },
  { id: "2", restaurant_id: "demo", name: "María López", email: "maria@test.com", phone: "+34623456789", avatar_emoji: "👩‍🍳", role: "waiter", iban: "ES34 9876 5432 1098 7654 3210", stripe_payout_id: "acct_2", active: true, created_at: "2024-02-15" },
  { id: "3", restaurant_id: "demo", name: "Pedro Ruiz", email: "pedro@test.com", phone: "+34634567890", avatar_emoji: "🧑‍🍳", role: "waiter", iban: null, stripe_payout_id: null, active: true, created_at: "2024-03-01" },
];

const mockPendingInvites: InviteCode[] = [
  {
    id: "inv1",
    restaurant_id: "demo",
    code: "MP-A3K7YN",
    phone: "+34645678901",
    name: "Laura Martín",
    used: false,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

export default function EquipoPage() {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-[family-name:var(--font-serif)] text-[#0D1B1E]">
          Equipo
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona los miembros de tu equipo y envía invitaciones
        </p>
      </div>

      {/* Team list */}
      <div className="mb-8">
        <TeamList staff={mockStaff} onInvite={() => setInviteOpen(true)} />
      </div>

      {/* Pending invites */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-[#0D1B1E]">
            Invitaciones pendientes
          </h3>
        </div>
        {mockPendingInvites.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {mockPendingInvites.map((inv) => (
              <div
                key={inv.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-lg">
                    ✉️
                  </div>
                  <div>
                    <p className="font-semibold text-[#0D1B1E] text-sm">
                      {inv.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {inv.phone} &middot; Código: {inv.code}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="pending">Pendiente</Badge>
                  <span className="text-xs text-gray-400">
                    {getRelativeTime(inv.created_at)}
                  </span>
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
        restaurantId="demo"
      />
    </div>
  );
}
