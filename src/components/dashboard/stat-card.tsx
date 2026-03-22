import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  trend?: { value: number; positive: boolean };
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: string;
}

function StatCard({ label, value, trend, subtitle, icon, accent = "#2ECC87" }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: accent }} />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium mb-2">{label}</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-[family-name:var(--font-serif)] text-[#0D1B1E] leading-tight">
              {value}
            </p>
            {trend && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-bold mb-1 ${
                  trend.positive ? "text-[#2ECC87]" : "text-red-500"
                }`}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={trend.positive ? "" : "rotate-180"}
                >
                  <path d="M6 2.5L10 7.5H2L6 2.5Z" fill="currentColor" />
                </svg>
                {trend.value}%
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${accent}15` }}
          >
            {icon}
          </div>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-3">{subtitle}</p>
      )}
    </Card>
  );
}

export { StatCard };
export type { StatCardProps };
