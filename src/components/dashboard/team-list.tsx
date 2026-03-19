"use client";

import type { Staff } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TeamListProps {
  staff: Staff[];
  onInvite: () => void;
}

function TeamList({ staff, onInvite }: TeamListProps) {
  const [members, setMembers] = useState(staff);

  const toggleActive = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
  };

  const roleLabels: Record<string, string> = {
    owner: "Gerente",
    waiter: "Camarero",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#0D1B1E]">Equipo</h3>
        <Button size="sm" onClick={onInvite}>
          Añadir camarero
        </Button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3">IBAN</th>
              <th className="px-6 py-3">Stripe</th>
              <th className="px-6 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr
                key={m.id}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F5FAF7] flex items-center justify-center text-lg">
                      {m.avatar_emoji}
                    </div>
                    <div>
                      <p className="font-semibold text-[#0D1B1E] text-sm">
                        {m.name}
                      </p>
                      <p className="text-xs text-gray-400">{m.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={m.role === "owner" ? "info" : "active"}>
                    {roleLabels[m.role] || m.role}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  {m.iban ? (
                    <Badge variant="active">Verificado</Badge>
                  ) : (
                    <Badge variant="pending">Pendiente</Badge>
                  )}
                </td>
                <td className="px-6 py-4">
                  {m.stripe_payout_id ? (
                    <Badge variant="active">Stripe</Badge>
                  ) : (
                    <Badge variant="pending">Sin Stripe</Badge>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(m.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                      m.active ? "bg-[#2ECC87]" : "bg-gray-300"
                    }`}
                    role="switch"
                    aria-checked={m.active}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        m.active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="md:hidden divide-y divide-gray-100">
        {members.map((m) => (
          <div key={m.id} className="px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F5FAF7] flex items-center justify-center text-lg">
                  {m.avatar_emoji}
                </div>
                <div>
                  <p className="font-semibold text-[#0D1B1E] text-sm">{m.name}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant={m.role === "owner" ? "info" : "active"}>
                      {roleLabels[m.role] || m.role}
                    </Badge>
                    {m.iban ? (
                      <Badge variant="active">IBAN</Badge>
                    ) : (
                      <Badge variant="pending">Sin IBAN</Badge>
                    )}
                    {m.stripe_payout_id ? (
                      <Badge variant="active">Stripe</Badge>
                    ) : (
                      <Badge variant="pending">Sin Stripe</Badge>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleActive(m.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                  m.active ? "bg-[#2ECC87]" : "bg-gray-300"
                }`}
                role="switch"
                aria-checked={m.active}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    m.active ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { TeamList };
