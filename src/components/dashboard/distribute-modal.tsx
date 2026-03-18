"use client";

import { useState } from "react";
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
  const equalAmount = activeStaff.length > 0 ? Math.floor(totalCents / activeStaff.length) : 0;
  const equalRemainder = activeStaff.length > 0 ? totalCents - equalAmount * activeStaff.length : 0;

  const [method, setMethod] = useState<Method>("equal");
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>(
    () => Object.fromEntries(activeStaff.map((s) => [s.id, equalAmount]))
  );
  const [confirmed, setConfirmed] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [error, setError] = useState("");

  const getAmounts = (): Record<string, number> => {
    if (method === "equal") {
      return Object.fromEntries(
        activeStaff.map((s, i) => [s.id, equalAmount + (i === 0 ? equalRemainder : 0)])
      );
    }
    return customAmounts;
  };

  const amounts = getAmounts();
  const totalDistributed = Object.values(amounts).reduce((a, b) => a + b, 0);
  const isValid = method === "equal" || totalDistributed === totalCents;

  const handleCustomChange = (staffId: string, euros: string) => {
    const cents = Math.round(parseFloat(euros || "0") * 100);
    setCustomAmounts((prev) => ({ ...prev, [staffId]: cents }));
  };

  const handleConfirm = async () => {
    setDistributing(true);
    setError("");

    try {
      const payouts = activeStaff.map((s) => ({
        staff_id: s.id,
        amount_cents: amounts[s.id] || 0,
      }));

      const res = await fetch("/api/distribution/create", {
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
            Las transferencias se procesaran en breve
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
                  <th className="px-4 py-2.5">Nombre</th>
                  <th className="px-4 py-2.5 text-right">Importe</th>
                  <th className="px-4 py-2.5 text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {activeStaff.map((s) => {
                  const amt = amounts[s.id] || 0;
                  const pct = totalCents > 0 ? ((amt / totalCents) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={s.id} className="border-t border-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{s.avatar_emoji}</span>
                          <span className="text-sm font-medium text-[#0D1B1E]">
                            {s.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {method === "custom" ? (
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
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-400">
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Validation */}
          {method === "custom" && totalDistributed !== totalCents && (
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
            Confirmar reparto
          </Button>
        </div>
      )}
    </Modal>
  );
}

export { DistributeModal };
