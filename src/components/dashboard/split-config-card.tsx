"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Restaurant, Staff } from "@/lib/types";

type Mode = "equal" | "custom";

interface SplitConfigCardProps {
  restaurant: Restaurant;
  staff: Staff[];
  onSaved?: () => void;
}

export function SplitConfigCard({ restaurant, staff, onSaved }: SplitConfigCardProps) {
  const activeStaff = useMemo(() => staff.filter((s) => s.active), [staff]);
  const hasCustomConfig = useMemo(
    () => activeStaff.some((s) => s.default_share_pct !== null && s.default_share_pct !== undefined),
    [activeStaff]
  );

  const [mode, setMode] = useState<Mode>(hasCustomConfig ? "custom" : "equal");
  const [shares, setShares] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMode(hasCustomConfig ? "custom" : "equal");

    const initial: Record<string, string> = {};
    for (const s of activeStaff) {
      initial[s.id] =
        s.default_share_pct !== null && s.default_share_pct !== undefined
          ? String(s.default_share_pct)
          : "";
    }
    setShares(initial);
  }, [activeStaff, hasCustomConfig]);

  // Gerente siempre incluido en el reparto.
  const eligibleStaff = activeStaff;

  // Auto-equal: when the gerente flips to "equitativo" or toggles owner inclusion,
  // reset all shares to an even split across eligibleStaff.
  function applyEqualShares() {
    const n = eligibleStaff.length || 1;
    const equal = parseFloat((100 / n).toFixed(2));
    const next: Record<string, string> = {};
    for (const s of activeStaff) next[s.id] = "";
    eligibleStaff.forEach((s, i) => {
      if (i === eligibleStaff.length - 1) {
        const sumSoFar = equal * (eligibleStaff.length - 1);
        next[s.id] = (100 - sumSoFar).toFixed(2);
      } else {
        next[s.id] = equal.toFixed(2);
      }
    });
    setShares(next);
  }

  const totalPct = useMemo(() => {
    return eligibleStaff.reduce((sum, s) => {
      const v = parseFloat(shares[s.id] || "0");
      return sum + (Number.isFinite(v) ? v : 0);
    }, 0);
  }, [shares, eligibleStaff]);

  const customValid = Math.abs(totalPct - 100) < 0.01;

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      let payloadShares: Array<{ staff_id: string; pct: number | null }> = [];

      if (mode === "custom") {
        if (!customValid) {
          throw new Error(`Los porcentajes deben sumar 100% (ahora: ${totalPct.toFixed(2)}%).`);
        }
        payloadShares = eligibleStaff.map((s) => ({
          staff_id: s.id,
          pct: parseFloat(shares[s.id] || "0"),
        }));
      }

      const res = await fetch("/api/restaurant/split-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          split_includes_owner: true,
          shares: payloadShares,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <h3 className="text-lg font-bold text-[#0D1B1E] mb-1">Reparto por defecto</h3>
      <p className="text-sm text-gray-500 mb-5">
        Define cómo se reparten las propinas por defecto. Los camareros verán su parte estimada del bote.
      </p>

      {/* Mode tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
        <button
          onClick={() => setMode("equal")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            mode === "equal" ? "bg-white text-[#0D1B1E] shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          A partes iguales
        </button>
        <button
          onClick={() => {
            setMode("custom");
            if (Object.values(shares).every((v) => !v)) {
              applyEqualShares();
            }
          }}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            mode === "custom" ? "bg-white text-[#0D1B1E] shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Personalizado
        </button>
      </div>

      {/* Staff list */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
              <th className="px-4 py-2.5">Miembro</th>
              <th className="px-4 py-2.5 text-right">{mode === "custom" ? "Porcentaje" : "Parte"}</th>
            </tr>
          </thead>
          <tbody>
            {activeStaff.map((s) => {
              const equalPart = eligibleStaff.length > 0 ? 100 / eligibleStaff.length : 0;
              return (
                <tr key={s.id} className="border-t border-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{s.avatar_emoji}</span>
                      <div>
                        <span className="text-sm font-medium text-[#0D1B1E]">{s.name}</span>
                        {s.role === "manager" && (
                          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                            Gerente
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {mode === "custom" ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={shares[s.id] ?? ""}
                          onChange={(e) =>
                            setShares((prev) => ({ ...prev, [s.id]: e.target.value }))
                          }
                          className="w-20 text-right bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-sm font-semibold text-[#0D1B1E] focus:border-[#2ECC87] focus:outline-none"
                        />
                        <span className="text-sm text-gray-400">%</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-600">{equalPart.toFixed(1)}%</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals + helpers */}
      {mode === "custom" && (
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={applyEqualShares}
            className="text-xs font-medium text-[#2ECC87] hover:underline"
            type="button"
          >
            Repartir a partes iguales
          </button>
          <span
            className={`text-xs font-medium ${
              customValid ? "text-[#2ECC87]" : "text-red-500"
            }`}
          >
            Total: {totalPct.toFixed(2)}% {customValid ? "✓" : "— debe ser 100"}
          </span>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-500 font-medium">{error}</p>
      )}

      {saved && (
        <p className="mt-4 text-sm text-[#2ECC87] font-medium">
          Configuración guardada ✓
        </p>
      )}

      <Button
        onClick={handleSave}
        loading={saving}
        disabled={saving || (mode === "custom" && !customValid)}
        size="lg"
        className="mt-5 w-full"
      >
        Guardar configuración
      </Button>
    </Card>
  );
}
