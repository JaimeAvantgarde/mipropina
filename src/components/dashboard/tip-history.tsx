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
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#0D1B1E]">Ultimas propinas</h3>
        {tips.length > 0 && (
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {tips.length}
          </span>
        )}
      </div>

      {/* Desktop table */}
      {tips.length > 0 && (
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
                    className={`transition-colors hover:bg-[#F5FAF7] ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tip.status === "completed" ? "bg-[#2ECC87]/10" :
                          tip.status === "failed" ? "bg-red-50" : "bg-amber-50"
                        }`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke={tip.status === "completed" ? "#2ECC87" : tip.status === "failed" ? "#EF4444" : "#F59E0B"}
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                        </div>
                        <span className="font-bold text-[#0D1B1E]">{formatCents(tip.amount_cents)}</span>
                      </div>
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
      )}

      {/* Mobile list */}
      {tips.length > 0 && (
        <div className="sm:hidden divide-y divide-gray-100">
          {tips.map((tip) => {
            const cfg = statusConfig[tip.status] || statusConfig.pending;
            return (
              <div key={tip.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tip.status === "completed" ? "bg-[#2ECC87]/10" :
                    tip.status === "failed" ? "bg-red-50" : "bg-amber-50"
                  }`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke={tip.status === "completed" ? "#2ECC87" : tip.status === "failed" ? "#EF4444" : "#F59E0B"}
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-[#0D1B1E]">{formatCents(tip.amount_cents)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {getRelativeTime(tip.created_at)}
                    </p>
                  </div>
                </div>
                <Badge variant={cfg.variant}>{cfg.label}</Badge>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {tips.length === 0 && (
        <div className="px-6 py-14 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#F5FAF7] flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2ECC87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <p className="font-semibold text-[#0D1B1E] mb-1">Sin propinas todavia</p>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            Cuando tus clientes escaneen el QR y dejen propina, aparecera aqui
          </p>
        </div>
      )}
    </div>
  );
}

export { TipHistory };
