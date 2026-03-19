"use client";

import { useState, useMemo, useEffect } from "react";
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

  const [method, setMethod] = useState<Method>("equal");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(activeStaff.map((s) => s.id))
  );
  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [error, setError] = useState("");

  const selectedStaff = useMemo(
    () => activeStaff.filter((s) => selectedIds.has(s.id)),
    [activeStaff, selectedIds]
  );

  const selectedCount = selectedStaff.length;

  const selectedKey = useMemo(
    () => selectedStaff.map((s) => s.id).join(","),
    [selectedStaff]
  );

  // Initialize equal percentages when selection changes or method switches to custom
  useEffect(() => {
    if (method === "custom" && selectedCount > 0) {
      const equalPct = parseFloat((100 / selectedCount).toFixed(2));
      const newPcts: Record<string, number> = {};
      selectedStaff.forEach((s, i) => {
        if (i === selectedCount - 1) {
          // Last person gets the remainder to ensure sum = 100
          const sumSoFar = equalPct * (selectedCount - 1);
          newPcts[s.id] = parseFloat((100 - sumSoFar).toFixed(2));
        } else {
          newPcts[s.id] = equalPct;
        }
      });
      setPercentages(newPcts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, selectedCount, selectedKey]);

  const equalAmount = selectedCount > 0 ? Math.floor(totalCents / selectedCount) : 0;
  const equalRemainder = selectedCount > 0 ? totalCents - equalAmount * selectedCount : 0;

  const totalPercentage = useMemo(() => {
    if (method !== "custom") return 100;
    return selectedStaff.reduce((sum, s) => sum + (percentages[s.id] || 0), 0);
  }, [method, selectedStaff, percentages]);

  const getAmounts = (): Record<string, number> => {
    if (method === "equal") {
      return Object.fromEntries(
        selectedStaff.map((s, i) => [s.id, equalAmount + (i === 0 ? equalRemainder : 0)])
      );
    }
    // Convert percentages to cents
    const amounts: Record<string, number> = {};
    let distributed = 0;
    selectedStaff.forEach((s, i) => {
      const pct = percentages[s.id] || 0;
      if (i === selectedCount - 1) {
        // Last person gets remainder to avoid rounding issues
        amounts[s.id] = totalCents - distributed;
      } else {
        const amt = Math.round((pct / 100) * totalCents);
        amounts[s.id] = amt;
        distributed += amt;
      }
    });
    return amounts;
  };

  const amounts = getAmounts();
  const totalDistributed = Object.values(amounts).reduce((a, b) => a + b, 0);
  const percentagesValid = Math.abs(totalPercentage - 100) < 0.01;
  const isValid = selectedCount > 0 && (method === "equal" || percentagesValid);

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

  const handlePercentageChange = (staffId: string, value: string) => {
    const pct = parseFloat(value || "0");
    setPercentages((prev) => ({ ...prev, [staffId]: pct }));
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
              Por porcentaje
            </button>
          </div>

          {/* Distribution preview */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                  <th className="px-4 py-2.5 w-8"></th>
                  <th className="px-4 py-2.5">Nombre</th>
                  {method === "custom" ? (
                    <>
                      <th className="px-4 py-2.5 text-right">%</th>
                      <th className="px-4 py-2.5 text-right">Importe</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-2.5 text-right">Importe</th>
                      <th className="px-4 py-2.5 text-right">%</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {/* Connected staff (selectable) */}
                {activeStaff.map((s) => {
                  const isSelected = selectedIds.has(s.id);
                  const amt = isSelected ? (amounts[s.id] || 0) : 0;
                  const pct = method === "custom"
                    ? (isSelected ? (percentages[s.id] || 0) : 0)
                    : (totalCents > 0 && isSelected ? ((amt / totalCents) * 100).toFixed(1) : "0.0");
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
                      {method === "custom" ? (
                        <>
                          <td className="px-4 py-3 text-right">
                            {isSelected ? (
                              <div className="flex items-center justify-end gap-1">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="100"
                                  value={percentages[s.id] ?? 0}
                                  onChange={(e) => handlePercentageChange(s.id, e.target.value)}
                                  className="w-20 text-right bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-sm font-semibold text-[#0D1B1E] focus:border-[#2ECC87] focus:outline-none"
                                />
                                <span className="text-sm text-gray-400">%</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isSelected ? (
                              <span className="text-sm font-bold text-[#0D1B1E]">
                                {formatCents(amt)}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-right">
                            {isSelected ? (
                              <span className="text-sm font-bold text-[#0D1B1E]">
                                {formatCents(amt)}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-400">
                            {isSelected ? `${pct}%` : "—"}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>

          {/* Percentage total indicator (custom mode) */}
          {method === "custom" && selectedCount > 0 && (
            <div className={`text-center text-xs font-medium ${
              percentagesValid ? "text-[#2ECC87]" : "text-red-500"
            }`}>
              Total: {totalPercentage.toFixed(1)}% {percentagesValid ? "✓" : `— debe ser 100%`}
            </div>
          )}

          {/* Info note */}
          {selectedCount > 0 && (
            <div className="bg-[#F5FAF7] border border-[#2ECC87]/20 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-gray-600">
                {selectedStaff.filter(s => s.stripe_payout_id).length > 0
                  ? `${selectedStaff.filter(s => s.stripe_payout_id).length} con Stripe → transferencia automática. ${selectedStaff.filter(s => !s.stripe_payout_id).length > 0 ? `${selectedStaff.filter(s => !s.stripe_payout_id).length} sin Stripe → pago manual (Bizum/transferencia).` : ""}`
                  : "Sin Stripe Connect activo. El reparto queda registrado para pago manual (Bizum/transferencia)."}
              </p>
            </div>
          )}

          {/* Validation */}
          {method === "custom" && selectedCount > 0 && !percentagesValid && (
            <p className="text-xs text-red-500 text-center font-medium">
              Los porcentajes deben sumar 100%. Actualmente: {totalPercentage.toFixed(1)}%
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
