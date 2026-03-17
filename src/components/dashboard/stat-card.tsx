import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  trend?: { value: number; positive: boolean };
  subtitle?: string;
}

function StatCard({ label, value, trend, subtitle }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
      <div className="flex items-end gap-3">
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
              <path
                d="M6 2.5L10 7.5H2L6 2.5Z"
                fill="currentColor"
              />
            </svg>
            {trend.value}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
      )}
    </Card>
  );
}

export { StatCard };
export type { StatCardProps };
