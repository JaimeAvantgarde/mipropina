"use client";

import { cn } from "@/lib/utils";

type AmountGridProps = {
  amounts: number[];           // en cents (ej: [100, 200, 300, 500])
  selectedAmount: number | null;
  onSelect: (amountCents: number) => void;
};

export default function AmountGrid({ amounts, selectedAmount, onSelect }: AmountGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {amounts.map((cents) => {
        const euros = cents / 100;
        const isActive = selectedAmount === cents;
        return (
          <button
            key={cents}
            type="button"
            onClick={() => onSelect(cents)}
            className={cn(
              "relative rounded-[14px] border-2 py-5 text-center transition-all duration-200 ease-out cursor-pointer select-none",
              isActive
                ? "bg-[var(--brand-color,#2ECC87)] text-[#0D1B1E] border-[var(--brand-color,#2ECC87)] shadow-lg scale-[1.04]"
                : "bg-[#E8F5E9] text-[#1A3C34] border-transparent hover:border-[var(--brand-color,#2ECC87)]/30 active:scale-[0.97]"
            )}
          >
            <span
              className={cn(
                "block font-sans text-2xl leading-tight",
                isActive ? "font-extrabold" : "font-bold"
              )}
            >
              {euros % 1 === 0 ? `${euros}€` : `${euros.toFixed(2)}€`}
            </span>
            <span
              className={cn(
                "block text-xs mt-0.5 tracking-wide",
                isActive ? "text-[#0D1B1E]/70 font-semibold" : "text-[#1A3C34]/60"
              )}
            >
              euros
            </span>
          </button>
        );
      })}
    </div>
  );
}
