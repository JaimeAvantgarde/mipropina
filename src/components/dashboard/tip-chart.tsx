"use client";

import { useMemo } from "react";
import type { Tip } from "@/lib/types";

interface TipChartProps {
  tips: Tip[];
}

function TipChart({ tips }: TipChartProps) {
  const chartData = useMemo(() => {
    // Get last 14 days
    const days: { label: string; date: string; cents: number; count: number }[] = [];
    const now = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        label: d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
        date: dateStr,
        cents: 0,
        count: 0,
      });
    }

    // Aggregate completed tips by day
    const completedTips = tips.filter((t) => t.status === "completed");
    for (const tip of completedTips) {
      const tipDate = new Date(tip.created_at).toISOString().split("T")[0];
      const day = days.find((d) => d.date === tipDate);
      if (day) {
        day.cents += tip.amount_cents;
        day.count += 1;
      }
    }

    return days;
  }, [tips]);

  const maxCents = Math.max(...chartData.map((d) => d.cents), 100);
  const totalCents = chartData.reduce((sum, d) => sum + d.cents, 0);
  const totalCount = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#0D1B1E]">Propinas - últimos 14 días</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {totalCount} propina{totalCount !== 1 ? "s" : ""} · {(totalCents / 100).toFixed(2).replace(".", ",")} € total
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-1 h-32">
        {chartData.map((day, i) => {
          const height = maxCents > 0 ? Math.max((day.cents / maxCents) * 100, day.cents > 0 ? 8 : 2) : 2;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              {day.cents > 0 && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0D1B1E] text-white text-[10px] font-medium px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {(day.cents / 100).toFixed(2).replace(".", ",")} € · {day.count}
                </div>
              )}
              {/* Bar */}
              <div
                className={`w-full rounded-t-md transition-all duration-300 ${
                  day.cents > 0
                    ? "bg-[#2ECC87] group-hover:bg-[#27B576]"
                    : "bg-gray-100"
                }`}
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex gap-1 mt-2">
        {chartData.map((day, i) => (
          <div key={i} className="flex-1 text-center">
            {i % 2 === 0 && (
              <span className="text-[9px] text-gray-400">{day.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export { TipChart };
