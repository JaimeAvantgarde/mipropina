import type { Tip } from "@/lib/types";
import { formatCents, getRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TipHistoryProps {
  tips: Tip[];
}

const statusConfig: Record<string, { label: string; variant: "active" | "pending" | "error" }> = {
  completed: { label: "Completada", variant: "active" },
  pending: { label: "Pendiente", variant: "pending" },
  failed: { label: "Fallida", variant: "error" },
};

function TipHistory({ tips }: TipHistoryProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-[#0D1B1E]">Últimas propinas</h3>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-3">Importe</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {tips.map((tip, i) => {
              const cfg = statusConfig[tip.status] || statusConfig.pending;
              return (
                <tr
                  key={tip.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-6 py-4 font-bold text-[#0D1B1E]">
                    {formatCents(tip.amount_cents)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {getRelativeTime(tip.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="sm:hidden divide-y divide-gray-100">
        {tips.map((tip) => {
          const cfg = statusConfig[tip.status] || statusConfig.pending;
          return (
            <div key={tip.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-[#0D1B1E]">{formatCents(tip.amount_cents)}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {getRelativeTime(tip.created_at)}
                </p>
              </div>
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
            </div>
          );
        })}
      </div>

      {tips.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-400 text-sm">
          No hay propinas todavía
        </div>
      )}
    </div>
  );
}

export { TipHistory };
