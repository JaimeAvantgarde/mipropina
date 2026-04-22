"use client";

import type { Staff } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useState } from "react";

interface TeamListProps {
  staff: Staff[];
  onInvite: () => void;
  onRefresh?: () => void;
  readOnly?: boolean;
}

function TeamList({ staff, onInvite, onRefresh, readOnly = false }: TeamListProps) {
  const [members, setMembers] = useState(staff);
  const [editingMember, setEditingMember] = useState<Staff | null>(null);
  const [deletingMember, setDeletingMember] = useState<Staff | null>(null);
  const [deactivatingMember, setDeactivatingMember] = useState<Staff | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", avatar_emoji: "" });
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const toggleActive = async (id: string) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;

    const newActive = !member.active;
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: newActive } : m))
    );

    try {
      const res = await fetch("/api/staff/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: newActive }),
      });
      if (!res.ok) {
        setMembers((prev) =>
          prev.map((m) => (m.id === id ? { ...m, active: !newActive } : m))
        );
      }
    } catch {
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, active: !newActive } : m))
      );
    }
  };

  const handleToggleActive = (id: string) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;
    if (member.active) {
      // Deactivating — ask for confirmation first
      setDeactivatingMember(member);
    } else {
      // Reactivating — no confirmation needed
      toggleActive(id);
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivatingMember) return;
    setDeactivating(true);
    await toggleActive(deactivatingMember.id);
    setDeactivating(false);
    setDeactivatingMember(null);
  };

  const openEdit = (member: Staff) => {
    setEditError(null);
    setEditForm({
      name: member.name,
      email: member.email,
      phone: member.phone || "",
      avatar_emoji: member.avatar_emoji,
    });
    setEditingMember(member);
  };

  const handleSaveEdit = async () => {
    if (!editingMember) return;
    setSaving(true);
    try {
      const res = await fetch("/api/staff/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingMember.id,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          avatar_emoji: editForm.avatar_emoji,
        }),
      });
      if (res.ok) {
        const { staff: updated } = await res.json();
        setMembers((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m))
        );
        setEditingMember(null);
        onRefresh?.();
      }
    } catch {
      setEditError("No se pudieron guardar los cambios. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingMember) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/staff/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingMember.id }),
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== deletingMember.id));
        setDeletingMember(null);
        onRefresh?.();
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  const roleLabels: Record<string, string> = {
    owner: "Gerente",
    waiter: "Camarero",
  };

  const emojiOptions = ["😊", "😎", "🤠", "👨‍🍳", "👩‍🍳", "🧑‍🍳", "🍕", "🍻", "☕", "🎯", "⭐", "🌟"];

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#0D1B1E]">Equipo</h3>
          {!readOnly && (
            <Button size="sm" onClick={onInvite}>
              Añadir camarero
            </Button>
          )}
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
                {!readOnly && <th className="px-6 py-3 text-right">Acciones</th>}
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
                    {readOnly ? (
                      <Badge variant={m.active ? "active" : "pending"}>
                        {m.active ? "Activo" : "Inactivo"}
                      </Badge>
                    ) : (
                      <button
                        onClick={() => handleToggleActive(m.id)}
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
                    )}
                  </td>
                  {!readOnly && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(m)}
                        className="p-1.5 text-gray-400 hover:text-[#2ECC87] hover:bg-[#F5FAF7] rounded-lg transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </button>
                      {m.role !== "owner" && (
                        <button
                          onClick={() => setDeletingMember(m)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="md:hidden divide-y divide-gray-100">
          {members.map((m) => (
            <div key={m.id} className="px-4 py-4">
              {/* Top row: avatar + name + toggle */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-[#F5FAF7] flex items-center justify-center text-xl flex-shrink-0">
                  {m.avatar_emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0D1B1E] text-sm leading-tight">{m.name}</p>
                  {m.phone && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{m.phone}</p>
                  )}
                </div>
                {!readOnly && (
                  <button
                    onClick={() => handleToggleActive(m.id)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                      m.active ? "bg-[#2ECC87]" : "bg-gray-300"
                    }`}
                    role="switch"
                    aria-checked={m.active}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        m.active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Badges row */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge variant={m.role === "owner" ? "info" : "active"}>
                  {roleLabels[m.role] || m.role}
                </Badge>
                <Badge variant={m.active ? "active" : "pending"}>
                  {m.active ? "Activo" : "Inactivo"}
                </Badge>
                <Badge variant={m.iban ? "active" : "pending"}>
                  {m.iban ? "IBAN ✓" : "Sin IBAN"}
                </Badge>
                <Badge variant={m.stripe_payout_id ? "active" : "pending"}>
                  {m.stripe_payout_id ? "Stripe ✓" : "Sin Stripe"}
                </Badge>
              </div>

              {/* Action buttons */}
              {!readOnly && (
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(m)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                    Editar
                  </button>
                  {m.role !== "owner" && (
                    <button
                      onClick={() => setDeletingMember(m)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                      Eliminar
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit modal */}
      <Modal
        open={!!editingMember}
        onClose={() => setEditingMember(null)}
        title={`Editar ${editingMember?.name || ""}`}
      >
        <div className="flex flex-col gap-4">
          {/* Avatar emoji selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setEditForm((f) => ({ ...f, avatar_emoji: emoji }))}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center cursor-pointer transition-all ${
                    editForm.avatar_emoji === emoji
                      ? "bg-[#2ECC87]/20 ring-2 ring-[#2ECC87] scale-110"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:border-[#2ECC87] focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:border-[#2ECC87] focus:outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Telefono
            </label>
            <input
              type="tel"
              value={editForm.phone}
              onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:border-[#2ECC87] focus:outline-none"
            />
          </div>

          {editError && (
            <p className="text-xs text-red-500 text-center -mb-1">{editError}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setEditingMember(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              loading={saving}
              disabled={!editForm.name.trim() || !editForm.email.trim()}
              className="flex-1"
            >
              Guardar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Deactivate confirmation modal */}
      <Modal
        open={!!deactivatingMember}
        onClose={() => setDeactivatingMember(null)}
        title="Desactivar miembro"
      >
        <div className="flex flex-col gap-5">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-2xl mx-auto mb-3">
              {deactivatingMember?.avatar_emoji}
            </div>
            <p className="text-sm text-gray-600">
              ¿Desactivar a{" "}
              <span className="font-semibold text-[#0D1B1E]">
                {deactivatingMember?.name}
              </span>?
            </p>
            <p className="text-xs text-gray-400 mt-2">
              No recibirá repartos ni aparecerá como activo. Puedes reactivarlo en cualquier momento.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeactivatingMember(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <button
              onClick={confirmDeactivate}
              disabled={deactivating}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {deactivating ? "Desactivando..." : "Desactivar"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deletingMember}
        onClose={() => setDeletingMember(null)}
        title="Eliminar miembro"
      >
        <div className="flex flex-col gap-5">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-2xl mx-auto mb-3">
              {deletingMember?.avatar_emoji}
            </div>
            <p className="text-sm text-gray-600">
              ¿Estas seguro de que quieres eliminar a{" "}
              <span className="font-semibold text-[#0D1B1E]">
                {deletingMember?.name}
              </span>{" "}
              del equipo?
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Esta accion no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeletingMember(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export { TeamList };
