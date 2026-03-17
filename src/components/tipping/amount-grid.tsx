"use client";

import { cn } from "@/lib/utils";

const AMOUNTS = [1, 2, 3, 5, 10, 20];

type AmountGridProps = {
  selectedAmount: number | null;
  onSelect: (amount: number) => void;
};

export default function AmountGrid({ selectedAmount, onSelect }: AmountGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {AMOUNTS.map((amount) => {
        const isActive = selectedAmount === amount;
        return (
          <button
            key={amount}
            type="button"
            onClick={() => onSelect(amount)}
            className={cn(
              "relative rounded-[14px] border-2 py-5 text-center transition-all duration-200 ease-out cursor-pointer select-none",
              isActive
                ? "bg-[#2ECC87] text-[#0D1B1E] border-[#2ECC87] shadow-lg scale-[1.04]"
                : "bg-[#E8F5E9] text-[#1A3C34] border-transparent hover:border-[#2ECC87]/30 active:scale-[0.97]"
            )}
          >
            <span
              className={cn(
                "block font-sans text-2xl leading-tight",
                isActive ? "font-extrabold" : "font-bold"
              )}
            >
              {amount}€
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
