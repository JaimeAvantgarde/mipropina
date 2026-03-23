"use client";

import { useMemo, useState } from "react";
import type { Tip } from "@/lib/types";

interface TipChartProps {
  tips: Tip[];
}

type Range = "7d" | "14d" | "30d";

function TipChart({ tips }: TipChartProps) {
  const [range, setRange] = useState<Range>("14d");
  const daysCount = range === "7d" ? 7 : range === "14d" ? 14 : 30;

  const chartData = useMemo(() => {
    const days: { label: string; shortLabel: string; date: string; cents: number; count: number }[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayOfWeek = d.toLocaleDateString("es-ES", { weekday: "short" });
      days.push({
        label: d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
        shortLabel: dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1, 3),
        date: dateStr,
        cents: 0,
        count: 0,
      });
    }

    const completedTips = tips.filter((t) => t.status === "completed");
    for (const tip of completedTips) {
      const tipDate = new Date(tip.created_at).toISOString().split("T")[0];
      const day = days.find((d) => d.date === tipDate);
      if (day) {
        day.cents += tip.amount_cents - (tip.platform_fee_cents || 0);
        day.count += 1;
      }
    }

    return days;
  }, [tips, daysCount]);

  const maxCents = Math.max(...chartData.map((d) => d.cents), 50);
  const totalCents = chartData.reduce((sum, d) => sum + d.cents, 0);
  const totalCount = chartData.reduce((sum, d) => sum + d.count, 0);
  const bestDay = chartData.reduce((best, d) => d.cents > best.cents ? d : best, chartData[0]);
  const hasAnyData = totalCount > 0;

  // Show every Nth label depending on range
  const labelInterval = range === "7d" ? 1 : range === "14d" ? 2 : 5;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[#0D1B1E]">Actividad</h3>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-[#0D1B1E]">{(totalCents / 100).toFixed(2).replace(".", ",")} &euro;</span> en {totalCount} propina{totalCount !== 1 ? "s" : ""}
            </p>
            {bestDay && bestDay.cents > 0 && (
              <p className="text-xs text-gray-400 hidden sm:block">
                Mejor dia: <span className="font-medium text-[#2ECC87]">{bestDay.label}</span> ({(bestDay.cents / 100).toFixed(2).replace(".", ",")} &euro;)
              </p>
            )}
          </div>
        </div>

        {/* Range selector */}
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {(["7d", "14d", "30d"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                range === r
                  ? "bg-white text-[#0D1B1E] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {r === "7d" ? "7 dias" : r === "14d" ? "14 dias" : "30 dias"}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="px-6 pb-2">
        {hasAnyData ? (
          <div className="flex items-end gap-[3px] h-40">
            {chartData.map((day, i) => {
              const height = maxCents > 0 ? Math.max((day.cents / maxCents) * 100, day.cents > 0 ? 10 : 2) : 2;
              const isToday = i === chartData.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative">
                  {/* Tooltip */}
                  {day.cents > 0 && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#0D1B1E] text-white text-[10px] font-medium px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                      <span className="font-bold">{(day.cents / 100).toFixed(2).replace(".", ",")} &euro;</span>
                      <span className="text-white/60 ml-1">{day.count} propina{day.count !== 1 ? "s" : ""}</span>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0D1B1E] rotate-45" />
                    </div>
                  )}
                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-[4px] transition-all duration-300 ${
                      day.cents > 0
                        ? isToday
                          ? "bg-[#0D1B1E] group-hover:bg-[#1a2e32]"
                          : "bg-[#2ECC87] group-hover:bg-[#27B576]"
                        : "bg-gray-100"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-center">
            <div className="text-3xl opacity-30 mb-2">📊</div>
            <p className="text-sm text-gray-400">Las propinas que recibas apareceran aqui</p>
          </div>
        )}

        {/* X-axis labels */}
        <div className="flex gap-[3px] mt-1.5 border-t border-gray-100 pt-2 pb-3">
          {chartData.map((day, i) => (
            <div key={i} className="flex-1 text-center">
              {i % labelInterval === 0 && (
                <span className="text-[9px] text-gray-400 leading-none">
                  {range === "7d" ? day.shortLabel : day.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#2ECC87]" />
          <span className="text-[10px] text-gray-400 font-medium">Propinas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#0D1B1E]" />
          <span className="text-[10px] text-gray-400 font-medium">Hoy</span>
        </div>
      </div>
    </div>
  );
}

export { TipChart };
