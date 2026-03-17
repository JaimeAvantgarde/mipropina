"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type CustomAmountProps = {
  value: string;
  onChange: (value: string) => void;
  expanded: boolean;
  onToggle: () => void;
};

export default function CustomAmount({
  value,
  onChange,
  expanded,
  onToggle,
}: CustomAmountProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  function handleChange(raw: string) {
    // Allow only digits and a single decimal separator (dot or comma)
    const normalised = raw.replace(",", ".");
    if (normalised === "" || normalised === ".") {
      onChange(normalised);
      return;
    }
    // Match valid decimal number patterns
    if (/^\d{0,3}(\.\d{0,2})?$/.test(normalised)) {
      const num = parseFloat(normalised);
      if (!isNaN(num) && num <= 200) {
        onChange(normalised);
      }
    }
  }

  const numericValue = parseFloat((value || "0").replace(",", "."));
  const isValid = !isNaN(numericValue) && numericValue >= 0.5 && numericValue <= 200;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer",
          expanded
            ? "bg-[#0D1B1E] text-white"
            : "bg-transparent text-[#1A3C34] border border-[#1A3C34]/20 hover:border-[#2ECC87]/50"
        )}
      >
        {expanded ? "Volver a cantidades" : "Otra cantidad"}
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          expanded ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
        )}
      >
        <div className="relative flex items-center justify-center bg-[#E8F5E9] rounded-2xl px-6 py-5">
          <span className="absolute left-6 text-2xl font-bold text-[#1A3C34]/40 font-serif">
            €
          </span>
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full bg-transparent text-center text-3xl font-serif font-bold text-[#0D1B1E] outline-none placeholder:text-[#1A3C34]/30"
          />
        </div>
        {value && !isValid && (
          <p className="text-xs text-center text-red-500 mt-2">
            Introduce una cantidad entre 0,50€ y 200€
          </p>
        )}
      </div>
    </div>
  );
}
