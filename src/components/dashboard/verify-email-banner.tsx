"use client";

import { useState } from "react";

export function VerifyEmailBanner({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResend() {
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Error.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">📧</span>
        <div>
          <p className="font-semibold text-amber-900 text-sm">Verifica tu email</p>
          <p className="text-xs text-amber-800 mt-0.5">
            Te enviamos un enlace a <span className="font-mono">{email}</span>.
            Hasta verificarlo no podrás conectar Stripe para recibir cobros.
          </p>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
      </div>
      <button
        onClick={handleResend}
        disabled={sending || sent}
        className="flex-shrink-0 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap"
      >
        {sent ? "✓ Enviado" : sending ? "Enviando…" : "Reenviar email"}
      </button>
    </div>
  );
}
