"use client";

import { useState, useEffect, use } from "react";
import AmountGrid from "@/components/tipping/amount-grid";
import CustomAmount from "@/components/tipping/custom-amount";
import PaymentForm from "@/components/tipping/payment-form";
import { cn } from "@/lib/utils";

const DEFAULT_TIP_AMOUNTS = [100, 200, 300, 500]; // cents

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  logo_emoji: string | null;
  logo_url: string | null;
  theme_color: string;
  tip_amounts: number[] | null;
  custom_amount_enabled: boolean | null;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function TipPage({ params }: PageProps) {
  const { slug } = use(params);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState("");
  const [customExpanded, setCustomExpanded] = useState(false);

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const res = await fetch(`/api/restaurant/${slug}`);
        if (!res.ok) {
          setError("Restaurante no encontrado");
          return;
        }
        const data = await res.json();
        setRestaurant(data);
      } catch {
        setError("Error al cargar el restaurante");
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurant();
  }, [slug]);

  const tipAmounts = restaurant?.tip_amounts?.length
    ? restaurant.tip_amounts
    : DEFAULT_TIP_AMOUNTS;

  const showCustomAmount = restaurant?.custom_amount_enabled !== false;

  /* Derived amount in cents */
  let amountCents: number | null = null;
  if (customExpanded) {
    const parsed = parseFloat((customValue || "0").replace(",", "."));
    if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 200) {
      amountCents = Math.round(parsed * 100);
    }
  } else if (selectedAmount !== null) {
    amountCents = selectedAmount;
  }

  function handleGridSelect(cents: number) {
    setSelectedAmount(cents);
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5FAF7] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2ECC87] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (error || !restaurant) {
    return (
      <main className="min-h-screen bg-[#F5FAF7] flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="font-[family-name:var(--font-serif)] text-2xl text-[#0D1B1E] mb-2">
            Restaurante no encontrado
          </h1>
          <p className="text-sm text-[#1A3C34]/60">
            El enlace no es correcto o el restaurante ya no existe.
          </p>
        </div>
      </main>
    );
  }

  const brandColor = restaurant.theme_color || "#2ECC87";

  return (
    <main
      className="min-h-screen bg-[#F5FAF7] flex flex-col items-center"
      style={{ "--brand-color": brandColor } as React.CSSProperties}
    >
      {/* Brand accent header strip */}
      <div
        className="w-full h-28 bg-gradient-to-b to-transparent"
        style={{ background: `linear-gradient(to bottom, ${brandColor}33, transparent)` }}
      />

      {/* Card */}
      <div className="w-full max-w-md mx-auto -mt-16 px-4 pb-10">
        <div className="bg-white rounded-3xl shadow-[0_4px_32px_rgba(0,0,0,0.08)] px-6 pt-8 pb-8">
          {/* Restaurant header */}
          <div className="text-center mb-8">
            {restaurant.logo_url ? (
              <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full shadow-md">
                <img src={restaurant.logo_url} alt={restaurant.name} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="text-6xl mb-3 leading-none">{restaurant.logo_emoji || "🍽️"}</div>
            )}
            <h1 className="font-[family-name:var(--font-serif)] text-2xl text-[#0D1B1E] leading-tight">
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
              amounts={tipAmounts}
              selectedAmount={selectedAmount}
              onSelect={handleGridSelect}
            />
          </div>

          {/* Custom amount */}
          {showCustomAmount && (
            <CustomAmount
              value={customValue}
              onChange={setCustomValue}
              expanded={customExpanded}
              onToggle={handleToggleCustom}
            />
          )}

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
          Se aplica una comisi&oacute;n de servicio de 0,20 € por transacci&oacute;n
        </p>
        <p className="text-center text-[10px] text-[#1A3C34]/30 mt-1 font-medium tracking-wide">
          Pagos seguros con Stripe &middot; mipropina.es
        </p>
      </div>
    </main>
  );
}
