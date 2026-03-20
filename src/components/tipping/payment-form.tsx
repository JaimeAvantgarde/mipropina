"use client";

import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { formatCentsShort, CLIENT_FEE_CENTS } from "@/lib/utils";
import { useRouter } from "next/navigation";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

/* ───────── Stripe inner checkout form ───────── */

function CheckoutForm({ amountCents, slug }: { amountCents: number; slug: string }) {
  const totalCents = amountCents + CLIENT_FEE_CENTS;
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: submitErr } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/t/${slug}/success`,
      },
    });

    if (submitErr) {
      setError(submitErr.message ?? "Error al procesar el pago.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement options={{ layout: "tabs" }} />

      {/* Desglose propina + comisión */}
      <div className="rounded-xl bg-[#F5FAF7] border border-[#2ECC87]/20 px-4 py-3 space-y-1">
        <div className="flex justify-between text-sm text-[#1A3C34]/70">
          <span>Propina</span>
          <span>{formatCentsShort(amountCents)}</span>
        </div>
        <div className="flex justify-between text-sm text-[#1A3C34]/70">
          <span>Comisi&oacute;n de servicio</span>
          <span>{formatCentsShort(CLIENT_FEE_CENTS)}</span>
        </div>
        <div className="border-t border-[#2ECC87]/20 pt-1 flex justify-between text-sm font-bold text-[#0D1B1E]">
          <span>Total</span>
          <span>{formatCentsShort(totalCents)}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full py-4 rounded-2xl bg-[#2ECC87] text-[#0D1B1E] font-bold text-lg transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Procesando...
          </span>
        ) : (
          `Pagar ${formatCentsShort(totalCents)}`
        )}
      </button>

      <div className="flex items-center justify-center gap-3 pt-1">
        <div className="flex items-center gap-1 text-gray-400">
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-[10px] font-medium">Pago seguro SSL</span>
        </div>
        <span className="text-gray-300">·</span>
        <div className="flex items-center gap-1 text-gray-400">
          <span className="text-[10px] font-medium">Procesado por</span>
          <span className="text-[11px] font-bold text-[#635bff]">stripe</span>
        </div>
      </div>
    </form>
  );
}

/* ───────── Real Stripe payment form ───────── */

function StripePaymentForm({
  restaurantId,
  amountCents,
  slug,
}: {
  restaurantId: string;
  amountCents: number;
  slug: string;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createIntent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: restaurantId, amount_cents: amountCents }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo crear el pago.");
      }
      const data = await res.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al conectar con Stripe.");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, amountCents]);

  useEffect(() => {
    createIntent();
  }, [createIntent]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="h-8 w-8 rounded-full border-[3px] border-[#2ECC87] border-t-transparent animate-spin" />
        <p className="text-sm text-[#1A3C34]/60">Preparando el pago...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-4 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <button onClick={createIntent} className="mt-3 text-sm font-semibold text-[#2ECC87] underline cursor-pointer">
          Reintentar
        </button>
      </div>
    );
  }

  if (!clientSecret || !stripePromise) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#2ECC87",
            colorBackground: "#ffffff",
            colorText: "#0D1B1E",
            borderRadius: "12px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          },
        },
        locale: "es",
      }}
    >
      <CheckoutForm amountCents={amountCents} slug={slug} />
    </Elements>
  );
}

/* ───────── Mock payment form (no Stripe keys) ───────── */

function MockPaymentForm({
  amountCents,
  slug,
}: {
  amountCents: number;
  slug: string;
}) {
  const router = useRouter();
  const totalCents = amountCents + CLIENT_FEE_CENTS;
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function formatCardNumber(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    router.push(`/t/${slug}/success`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Desglose propina + comisión */}
      <div className="rounded-xl bg-[#F5FAF7] border border-[#2ECC87]/20 px-4 py-3 space-y-1">
        <div className="flex justify-between text-sm text-[#1A3C34]/70">
          <span>Propina</span>
          <span>{formatCentsShort(amountCents)}</span>
        </div>
        <div className="flex justify-between text-sm text-[#1A3C34]/70">
          <span>Comisi&oacute;n de servicio</span>
          <span>{formatCentsShort(CLIENT_FEE_CENTS)}</span>
        </div>
        <div className="border-t border-[#2ECC87]/20 pt-1 flex justify-between text-sm font-bold text-[#0D1B1E]">
          <span>Total</span>
          <span>{formatCentsShort(totalCents)}</span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button type="button" className="flex-1 py-3 px-4 text-sm font-medium text-[#0D1B1E] border-b-2 border-[#2ECC87] bg-white">
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Tarjeta
            </span>
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Número de tarjeta</label>
            <div className="relative">
              <input type="text" inputMode="numeric" placeholder="1234 1234 1234 1234" value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-16 text-sm text-[#0D1B1E] placeholder:text-gray-400 focus:border-[#2ECC87] focus:ring-1 focus:ring-[#2ECC87] focus:outline-none" required />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <div className="h-5 w-8 rounded bg-[#1a1f71] flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white italic">VISA</span>
                </div>
                <div className="h-5 w-8 rounded bg-[#eb001b] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute left-0.5 h-3.5 w-3.5 rounded-full bg-[#eb001b] opacity-80" />
                  <div className="absolute right-0.5 h-3.5 w-3.5 rounded-full bg-[#f79e1b] opacity-80" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Caducidad</label>
              <input type="text" inputMode="numeric" placeholder="MM/AA" value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))} maxLength={5}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm text-[#0D1B1E] placeholder:text-gray-400 focus:border-[#2ECC87] focus:ring-1 focus:ring-[#2ECC87] focus:outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">CVC</label>
              <input type="text" inputMode="numeric" placeholder="123" value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} maxLength={4}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm text-[#0D1B1E] placeholder:text-gray-400 focus:border-[#2ECC87] focus:ring-1 focus:ring-[#2ECC87] focus:outline-none" required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Titular</label>
            <input type="text" placeholder="Nombre completo" value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm text-[#0D1B1E] placeholder:text-gray-400 focus:border-[#2ECC87] focus:ring-1 focus:ring-[#2ECC87] focus:outline-none" />
          </div>
        </div>
      </div>

      <button type="submit" disabled={submitting || !cardNumber || !expiry || !cvc}
        className="w-full py-4 rounded-2xl bg-[#2ECC87] text-[#0D1B1E] font-bold text-lg transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Procesando pago...
          </span>
        ) : (
          `Pagar ${formatCentsShort(totalCents)}`
        )}
      </button>

      <div className="flex items-center justify-center gap-3 pt-1">
        <div className="flex items-center gap-1 text-gray-400">
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-[10px] font-medium">Pago seguro SSL</span>
        </div>
        <span className="text-gray-300">·</span>
        <div className="flex items-center gap-1 text-gray-400">
          <span className="text-[10px] font-medium">Procesado por</span>
          <span className="text-[11px] font-bold text-[#635bff]">stripe</span>
        </div>
      </div>
    </form>
  );
}

/* ───────── Exported component ───────── */

type PaymentFormProps = {
  restaurantId: string;
  amountCents: number;
  slug: string;
};

export default function PaymentForm({ restaurantId, amountCents, slug }: PaymentFormProps) {
  if (!stripePromise) {
    return <MockPaymentForm amountCents={amountCents} slug={slug} />;
  }
  return <StripePaymentForm restaurantId={restaurantId} amountCents={amountCents} slug={slug} />;
}
