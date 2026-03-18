"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCentsShort } from "@/lib/utils";
import { useRouter } from "next/navigation";

const hasStripeKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/* ───────── Mock payment form (no Stripe keys) ───────── */

function MockPaymentForm({
  amountCents,
  slug,
}: {
  amountCents: number;
  slug: string;
}) {
  const router = useRouter();
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
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 2000));
    router.push(`/t/${slug}/success`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card-like container mimicking Stripe's style */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            className="flex-1 py-3 px-4 text-sm font-medium text-[#0D1B1E] border-b-2 border-[#2ECC87] bg-white"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Tarjeta
            </span>
          </button>
          <button
            type="button"
            className="flex-1 py-3 px-4 text-sm font-medium text-gray-400 bg-gray-50"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.72 5.011H8.026c-1.178 0-2.156.852-2.35 1.975L3.68 18.986H5.96l.777-4.583h8.645l-.215 1.264h2.28l.214-1.264h2.28l-2.22-9.392zm-3.684 7.129H5.96l1.107-4.583h8.05l-1.08 4.583z" />
              </svg>
              Google Pay
            </span>
          </button>
        </div>

        {/* Card fields */}
        <div className="p-4 space-y-3">
          {/* Card number */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Número de tarjeta
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                placeholder="1234 1234 1234 1234"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-16 text-sm text-[#0D1B1E] placeholder:text-gray-400 focus:border-[#2ECC87] focus:ring-1 focus:ring-[#2ECC87] focus:outline-none transition-colors"
                required
              />
              {/* Card brand icons */}
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

          {/* Expiry + CVC row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Caducidad
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="MM/AA"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                maxLength={5}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm text-[#0D1B1E] placeholder:text-gray-400 focus:border-[#2ECC87] focus:ring-1 focus:ring-[#2ECC87] focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                CVC
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm text-[#0D1B1E] placeholder:text-gray-400 focus:border-[#2ECC87] focus:ring-1 focus:ring-[#2ECC87] focus:outline-none transition-colors"
                  required
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <rect x="14" y="9" width="6" height="6" rx="1" fill="currentColor" opacity={0.3} />
                </svg>
              </div>
            </div>
          </div>

          {/* Cardholder name */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Titular de la tarjeta
            </label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm text-[#0D1B1E] placeholder:text-gray-400 focus:border-[#2ECC87] focus:ring-1 focus:ring-[#2ECC87] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={submitting || !cardNumber || !expiry || !cvc}
        className="w-full py-4 rounded-2xl bg-[#2ECC87] text-[#0D1B1E] font-bold text-lg transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Procesando pago...
          </span>
        ) : (
          `Pagar ${formatCentsShort(amountCents)}`
        )}
      </button>

      {/* Security badges */}
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

/* ───────── Real Stripe form ───────── */

function RealCheckoutForm({
  amountCents,
  slug,
}: {
  amountCents: number;
  slug: string;
}) {
  // Dynamic imports to avoid loading Stripe SDK when not needed
  const [StripeComponents, setStripeComponents] = useState<{
    stripe: ReturnType<typeof import("@stripe/stripe-js").loadStripe> extends Promise<infer T> ? T : never;
    PaymentElement: typeof import("@stripe/react-stripe-js").PaymentElement;
    Elements: typeof import("@stripe/react-stripe-js").Elements;
    useStripe: typeof import("@stripe/react-stripe-js").useStripe;
    useElements: typeof import("@stripe/react-stripe-js").useElements;
  } | null>(null);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Stripe SDK dynamically
  useEffect(() => {
    async function init() {
      const { loadStripe } = await import("@stripe/stripe-js");
      const stripeModule = await import("@stripe/react-stripe-js");
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      setStripeComponents({
        stripe: stripe!,
        PaymentElement: stripeModule.PaymentElement,
        Elements: stripeModule.Elements,
        useStripe: stripeModule.useStripe,
        useElements: stripeModule.useElements,
      });
    }
    init();
  }, []);

  const createIntent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: "demo", amount_cents: amountCents }),
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
  }, [amountCents]);

  useEffect(() => {
    createIntent();
  }, [createIntent]);

  if (!StripeComponents || loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="h-8 w-8 rounded-full border-3 border-[#2ECC87] border-t-transparent animate-spin" />
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

  if (!clientSecret) return null;

  const { Elements, PaymentElement } = StripeComponents;

  return (
    <Elements
      stripe={Promise.resolve(StripeComponents.stripe)}
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
      <StripeInnerForm
        PaymentElement={PaymentElement}
        amountCents={amountCents}
        slug={slug}
      />
    </Elements>
  );
}

function StripeInnerForm({
  PaymentElement,
  amountCents,
  slug,
}: {
  PaymentElement: typeof import("@stripe/react-stripe-js").PaymentElement;
  amountCents: number;
  slug: string;
}) {
  const { useStripe, useElements } = require("@stripe/react-stripe-js");
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
      confirmParams: { return_url: `${window.location.origin}/t/${slug}/success` },
    });

    if (submitErr) {
      setError(submitErr.message ?? "Error al procesar el pago.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement options={{ layout: "tabs" }} />
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full py-4 rounded-2xl bg-[#2ECC87] text-[#0D1B1E] font-bold text-lg transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
          `Pagar ${formatCentsShort(amountCents)}`
        )}
      </button>
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
  void restaurantId;

  if (!hasStripeKey) {
    return <MockPaymentForm amountCents={amountCents} slug={slug} />;
  }

  return <RealCheckoutForm amountCents={amountCents} slug={slug} />;
}
