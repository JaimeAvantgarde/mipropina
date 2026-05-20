"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type State =
  | { kind: "loading" }
  | { kind: "ok"; alreadyVerified: boolean }
  | { kind: "error"; message: string };

export default function VerifyClient({ token }: { token: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok) {
          setState({ kind: "ok", alreadyVerified: !!data.alreadyVerified });
        } else {
          setState({ kind: "error", message: data.error || "Error." });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "error", message: "Error de red." });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.kind === "loading") {
    return (
      <>
        <div className="text-4xl mb-3">⏳</div>
        <p className="text-gray-600">Verificando tu email…</p>
      </>
    );
  }

  if (state.kind === "ok") {
    return (
      <>
        <div className="text-4xl mb-3">✅</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {state.alreadyVerified ? "Email ya verificado" : "¡Email verificado!"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Ya puedes entrar al dashboard.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-lg"
        >
          Ir al dashboard
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="text-4xl mb-3">⚠️</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">
        No se pudo verificar
      </h1>
      <p className="text-sm text-red-600 mb-4">{state.message}</p>
      <p className="text-sm text-gray-500">
        Entra a{" "}
        <Link href="/dashboard" className="text-emerald-600 underline">
          tu cuenta
        </Link>{" "}
        y pulsa &quot;Reenviar email&quot; en el banner amarillo.
      </p>
    </>
  );
}
