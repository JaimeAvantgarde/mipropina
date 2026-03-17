"use client";

import { useState, use } from "react";
import AmountGrid from "@/components/tipping/amount-grid";
import CustomAmount from "@/components/tipping/custom-amount";
import PaymentForm from "@/components/tipping/payment-form";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function TipPage({ params }: PageProps) {
  const { slug } = use(params);

  // Mock restaurant — will be replaced by Supabase fetch
  const restaurant = {
    id: "demo",
    name: "La Tasca de Maria",
    slug,
    logo_emoji: "\uD83C\uDF77",
    theme_color: "#2ECC87",
  };

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState("");
  const [customExpanded, setCustomExpanded] = useState(false);

  /* Derived amount in cents */
  let amountCents: number | null = null;
  if (customExpanded) {
    const parsed = parseFloat((customValue || "0").replace(",", "."));
    if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 200) {
      amountCents = Math.round(parsed * 100);
    }
  } else if (selectedAmount !== null) {
    amountCents = selectedAmount * 100;
  }

  function handleGridSelect(amount: number) {
    setSelectedAmount(amount);
    setCustomExpanded(false);
    setCustomValue("");
  }

  function handleToggleCustom() {
    const next = !customExpanded;
    setCustomExpanded(next);
    if (next) {
      setSelectedAmount(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5FAF7] flex flex-col items-center">
      {/* Green accent header strip */}
      <div className="w-full h-28 bg-gradient-to-b from-[#2ECC87]/20 to-transparent" />

      {/* Card */}
      <div className="w-full max-w-md mx-auto -mt-16 px-4 pb-10">
        <div className="bg-white rounded-3xl shadow-[0_4px_32px_rgba(0,0,0,0.08)] px-6 pt-8 pb-8">
          {/* Restaurant header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-3 leading-none">{restaurant.logo_emoji}</div>
            <h1 className="font-serif text-2xl text-[#0D1B1E] leading-tight">
              {restaurant.name}
            </h1>
          </div>

          {/* Question */}
          <p className="text-center text-sm text-[#1A3C34]/70 font-medium mb-5">
            ¿Cuánto quieres dejar de propina?
          </p>

          {/* Amount grid */}
          <div
            className={cn(
              "transition-opacity duration-200",
              customExpanded ? "opacity-40 pointer-events-none" : "opacity-100"
            )}
          >
            <AmountGrid
              selectedAmount={selectedAmount}
              onSelect={handleGridSelect}
            />
          </div>

          {/* Custom amount */}
          <CustomAmount
            value={customValue}
            onChange={setCustomValue}
            expanded={customExpanded}
            onToggle={handleToggleCustom}
          />

          {/* Payment form — slides in when amount is chosen */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-out",
              amountCents
                ? "max-h-[600px] opacity-100 mt-8"
                : "max-h-0 opacity-0 mt-0"
            )}
          >
            {amountCents && (
              <PaymentForm
                restaurantId={restaurant.id}
                amountCents={amountCents}
                slug={slug}
              />
            )}
          </div>

          {/* No amount hint */}
          {!amountCents && (
            <p className="text-center text-xs text-[#1A3C34]/40 mt-6">
              Selecciona una cantidad para continuar
            </p>
          )}
        </div>

        {/* Footer branding */}
        <p className="text-center text-[10px] text-[#1A3C34]/30 mt-6 font-medium tracking-wide">
          Pagos seguros con Stripe &middot; mipropina.es
        </p>
      </div>
    </main>
  );
}
