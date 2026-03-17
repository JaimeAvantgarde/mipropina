"use client";

import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { formatCentsShort } from "@/lib/utils";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

/* ───────── Inner checkout form ───────── */

type CheckoutFormProps = {
  amountCents: number;
  slug: string;
};

function CheckoutForm({ amountCents, slug }: CheckoutFormProps) {
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
    // If no error, Stripe redirects automatically
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

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
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Procesando...
          </span>
        ) : (
          `Dejar propina de ${formatCentsShort(amountCents)}`
        )}
      </button>
    </form>
  );
}

/* ───────── Outer wrapper that fetches clientSecret ───────── */

type PaymentFormProps = {
  restaurantId: string;
  amountCents: number;
  slug: string;
};

export default function PaymentForm({
  restaurantId,
  amountCents,
  slug,
}: PaymentFormProps) {
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
        body: JSON.stringify({
          restaurant_id: restaurantId,
          amount_cents: amountCents,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo crear el pago.");
      }
      const data = await res.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al conectar con Stripe."
      );
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
        <div className="h-8 w-8 rounded-full border-3 border-[#2ECC87] border-t-transparent animate-spin" />
        <p className="text-sm text-[#1A3C34]/60">Preparando el pago...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-4 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <button
          onClick={createIntent}
          className="mt-3 text-sm font-semibold text-[#2ECC87] underline cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!clientSecret) return null;

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
