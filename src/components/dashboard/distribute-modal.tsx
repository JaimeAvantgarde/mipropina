"use client";

import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/utils";
import type { Staff } from "@/lib/types";

interface DistributeModalProps {
  open: boolean;
  onClose: () => void;
  totalCents: number;
  staff: Staff[];
  restaurantId?: string;
}

type Method = "equal" | "custom";

function DistributeModal({ open, onClose, totalCents, staff, restaurantId }: DistributeModalProps) {
  const activeStaff = staff.filter((s) => s.active);
  const connectedStaff = activeStaff.filter((s) => !!s.stripe_payout_id);
  const unconnectedStaff = activeStaff.filter((s) => !s.stripe_payout_id);

  const [method, setMethod] = useState<Method>("equal");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(connectedStaff.map((s) => s.id))
  );
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [error, setError] = useState("");

  const selectedStaff = useMemo(
    () => connectedStaff.filter((s) => selectedIds.has(s.id)),
    [connectedStaff, selectedIds]
  );

  const selectedCount = selectedStaff.length;

  const equalAmount = selectedCount > 0 ? Math.floor(totalCents / selectedCount) : 0;
  const equalRemainder = selectedCount > 0 ? totalCents - equalAmount * selectedCount : 0;

  const getAmounts = (): Record<string, number> => {
    if (method === "equal") {
      return Object.fromEntries(
        selectedStaff.map((s, i) => [s.id, equalAmount + (i === 0 ? equalRemainder : 0)])
      );
    }
    return Object.fromEntries(
      selectedStaff.map((s) => [s.id, customAmounts[s.id] || 0])
    );
  };

  const amounts = getAmounts();
  const totalDistributed = Object.values(amounts).reduce((a, b) => a + b, 0);
  const isValid = selectedCount > 0 && (method === "equal" || totalDistributed === totalCents);

  const toggleStaff = (staffId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(staffId)) {
        next.delete(staffId);
      } else {
        next.add(staffId);
      }
      return next;
    });
  };

  const handleCustomChange = (staffId: string, euros: string) => {
    const cents = Math.round(parseFloat(euros || "0") * 100);
    setCustomAmounts((prev) => ({ ...prev, [staffId]: cents }));
  };

  const handleConfirm = async () => {
    setDistributing(true);
    setError("");

    try {
      const payouts = selectedStaff.map((s) => ({
        staff_id: s.id,
        amount_cents: amounts[s.id] || 0,
      }));

      const res = await fetch("/api/stripe/create-payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurantId || "demo",
          method,
          payouts,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error al crear el reparto");
      }

      setConfirmed(true);
      setTimeout(() => {
        setConfirmed(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el reparto");
    } finally {
      setDistributing(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Repartir propinas">
      {confirmed ? (
        <div className="py-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-lg font-bold text-[#0D1B1E]">
            Reparto confirmado
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Las transferencias se procesarán en breve
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Total */}
          <div className="bg-[#F5FAF7] rounded-2xl p-5 text-center">
            <p className="text-sm text-gray-500 mb-1">Total a repartir</p>
            <p className="text-4xl font-[family-name:var(--font-serif)] text-[#2ECC87]">
              {formatCents(totalCents)}
            </p>
          </div>

          {/* Method tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setMethod("equal")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                method === "equal"
                  ? "bg-white text-[#0D1B1E] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Equitativo
            </button>
            <button
              onClick={() => setMethod("custom")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                method === "custom"
                  ? "bg-white text-[#0D1B1E] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Personalizado
            </button>
          </div>

          {/* Distribution preview */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                  <th className="px-4 py-2.5 w-8"></th>
                  <th className="px-4 py-2.5">Nombre</th>
                  <th className="px-4 py-2.5 text-right">Importe</th>
                  <th className="px-4 py-2.5 text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {/* Connected staff (selectable) */}
                {connectedStaff.map((s) => {
                  const isSelected = selectedIds.has(s.id);
                  const amt = isSelected ? (amounts[s.id] || 0) : 0;
                  const pct = totalCents > 0 && isSelected ? ((amt / totalCents) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={s.id} className={`border-t border-gray-50 ${!isSelected ? "opacity-50" : ""}`}>
                      <td className="pl-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleStaff(s.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#2ECC87] focus:ring-[#2ECC87] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{s.avatar_emoji}</span>
                          <span className="text-sm font-medium text-[#0D1B1E]">
                            {s.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isSelected ? (
                          method === "custom" ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={(amt / 100).toFixed(2)}
                              onChange={(e) => handleCustomChange(s.id, e.target.value)}
                              className="w-24 text-right bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-sm font-semibold text-[#0D1B1E] focus:border-primary focus:outline-none"
                            />
                          ) : (
                            <span className="text-sm font-bold text-[#0D1B1E]">
                              {formatCents(amt)}
                            </span>
                          )
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-400">
                        {isSelected ? `${pct}%` : "—"}
                      </td>
                    </tr>
                  );
                })}

                {/* Unconnected staff (greyed out, not selectable) */}
                {unconnectedStaff.map((s) => (
                  <tr key={s.id} className="border-t border-gray-50 opacity-40">
                    <td className="pl-4 py-3">
                      <input
                        type="checkbox"
                        checked={false}
                        disabled
                        className="w-4 h-4 rounded border-gray-300 text-gray-300 cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{s.avatar_emoji}</span>
                        <span className="text-sm font-medium text-gray-400">
                          {s.name}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 uppercase">
                          Sin Stripe
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-400">—</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-400">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stripe fee note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-amber-700">
              Se cobrarán 2€ por cada persona que reciba una transferencia este mes
            </p>
            {selectedCount > 0 && (
              <p className="text-xs font-semibold text-amber-800 mt-1">
                Coste Stripe: {selectedCount} × 2€ = {selectedCount * 2}€
              </p>
            )}
          </div>

          {/* Validation */}
          {method === "custom" && selectedCount > 0 && totalDistributed !== totalCents && (
            <p className="text-xs text-red-500 text-center font-medium">
              Total asignado: {formatCents(totalDistributed)} — debe ser {formatCents(totalCents)}
            </p>
          )}

          {/* Error message */}
          {error && (
            <p className="text-xs text-red-500 text-center font-medium">
              {error}
            </p>
          )}

          {/* Confirm */}
          <Button
            onClick={handleConfirm}
            disabled={!isValid || distributing}
            loading={distributing}
            className="w-full"
            size="lg"
          >
            {selectedCount > 0
              ? `Confirmar reparto a ${selectedCount} persona${selectedCount === 1 ? "" : "s"}`
              : "Selecciona al menos una persona"}
          </Button>
        </div>
      )}
    </Modal>
  );
}

export { DistributeModal };
