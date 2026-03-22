"use client";

import { useState, useEffect, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Phone Demo – 3 pantallas animadas                                  */
/* ------------------------------------------------------------------ */

function ScreenScan() {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-6">
      {/* QR icon */}
      <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-2xl border-2 border-dashed border-[#2ECC87]/40 bg-[#2ECC87]/5">
        <svg
          className="h-16 w-16 text-[#2ECC87]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 14.625v2.25m0 3.375h3.375m-3.375 0v-3.375m0 0h3.375m0 0v3.375m0-3.375h2.25m-2.25 0v-2.25"
          />
        </svg>
      </div>
      <p className="text-sm font-bold text-gray-800">Escanea el QR de tu mesa</p>
      <p className="mt-1 text-xs text-gray-400">La Tasca de Mar&iacute;a</p>
    </div>
  );
}

function ScreenChoose() {
  const amounts = [2, 5, 10, 20];
  const selected = 5;

  return (
    <div className="px-5 py-4">
      {/* Restaurant mini header */}
      <div className="mb-3 text-center">
        <p className="text-[13px] font-bold text-gray-800">La Tasca de Mar&iacute;a</p>
        <p className="text-[10px] text-gray-400">Mesa 4</p>
      </div>

      {/* Label */}
      <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        Elige la propina
      </p>

      {/* Amount grid */}
      <div className="mb-3 grid grid-cols-4 gap-1.5">
        {amounts.map((a) => (
          <div
            key={a}
            className={`rounded-xl py-2 text-center text-xs font-bold transition-all ${
              a === selected
                ? "bg-[#2ECC87] text-white shadow-[0_4px_12px_rgba(46,204,135,0.35)] scale-105"
                : "bg-white text-gray-600 shadow-sm"
            }`}
          >
            {a}&euro;
          </div>
        ))}
      </div>

      {/* Custom amount */}
      <div className="mb-3 flex items-center rounded-xl bg-white px-3 py-2 shadow-sm">
        <span className="text-[11px] text-gray-400">Otra cantidad:</span>
        <span className="ml-auto text-[11px] font-bold text-gray-300">0,00 &euro;</span>
      </div>

      {/* Pay button */}
      <div className="rounded-2xl bg-[#2ECC87] py-3 text-center text-xs font-bold text-white shadow-[0_6px_20px_rgba(46,204,135,0.4)]">
        Dejar propina &middot; 5,00 &euro;
      </div>
    </div>
  );
}

function ScreenDone() {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-8">
      {/* Animated check */}
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#2ECC87]/15 animate-[scaleIn_0.5s_ease-out]">
        <svg
          className="h-10 w-10 text-[#2ECC87]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <p className="text-sm font-bold text-gray-800">&iexcl;Gracias por tu propina!</p>
      <p className="mt-1.5 text-center text-xs leading-relaxed text-gray-400">
        El equipo de La Tasca<br />te lo agradece
      </p>
    </div>
  );
}

function PhoneMockup() {
  const [step, setStep] = useState(0);
  const screens = [ScreenScan, ScreenChoose, ScreenDone];

  const goTo = useCallback((idx: number) => setStep(idx), []);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const Screen = screens[step];

  return (
    <div className="relative mx-auto w-[260px] sm:w-[280px]">
      {/* Phone frame */}
      <div className="rounded-[2.5rem] border-[6px] border-white/10 bg-[#111] p-2 shadow-2xl">
        {/* Notch */}
        <div className="relative">
          <div className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-[#111]" />
        </div>

        {/* Screen */}
        <div className="overflow-hidden rounded-[2rem] bg-[#F5FAF7]">
          {/* Status bar */}
          <div className="flex items-center justify-between bg-white px-5 pb-2 pt-8">
            <span className="text-[10px] font-semibold text-gray-800">9:41</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                <div className="h-2 w-0.5 rounded-full bg-gray-800" />
                <div className="h-2.5 w-0.5 rounded-full bg-gray-800" />
                <div className="h-3 w-0.5 rounded-full bg-gray-800" />
                <div className="h-3.5 w-0.5 rounded-full bg-gray-800" />
              </div>
              <svg className="h-4 w-5 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                <rect x="1" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <rect x="20" y="10" width="2" height="4" rx="0.5" />
                <rect x="3" y="8" width="8" height="8" rx="1" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* Animated screen area */}
          <div className="relative min-h-[260px]">
            {screens.map((S, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-all duration-500 ease-in-out"
                style={{
                  opacity: step === i ? 1 : 0,
                  transform: step === i ? "translateY(0)" : "translateY(12px)",
                  pointerEvents: step === i ? "auto" : "none",
                }}
              >
                <S />
              </div>
            ))}
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-1.5 pb-4">
            <svg className="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-[10px] text-gray-400">Pago seguro con Stripe</span>
          </div>
        </div>
      </div>

      {/* Step dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {["Escanea", "Elige", "Listo"].map((label, i) => (
          <button
            key={label}
            onClick={() => goTo(i)}
            className="flex flex-col items-center gap-1"
            aria-label={label}
          >
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                step === i
                  ? "w-6 bg-[#2ECC87]"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
            />
            <span
              className={`text-[9px] font-medium transition-colors ${
                step === i ? "text-[#2ECC87]" : "text-white/30"
              }`}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Glow */}
      <div className="absolute -inset-8 -z-10 rounded-full bg-[#2ECC87]/10 blur-3xl" />

      {/* Scale-in keyframe for check icon */}
      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Trust Bar                                                          */
/* ------------------------------------------------------------------ */

function TrustBar() {
  const badges = ["Visa", "Mastercard", "Apple Pay", "Google Pay", "SEPA"];

  return (
    <div className="border-t border-white/5 bg-[#0D1B1E]/50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-4 text-center text-sm font-medium text-white/40">
          Compatible con
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {badges.map((name) => (
            <span
              key={name}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wide text-white/50 transition-colors hover:border-[#2ECC87]/30 hover:text-white/70"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0D1B1E]">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B1E] via-[#0D1B1E] to-[#2ECC87]/8" />

      <div className="relative mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 md:pt-36 md:pb-24 lg:px-8 lg:pt-40 lg:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ---- Text content ---- */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2ECC87]/20 bg-[#2ECC87]/10 px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#2ECC87]" />
              <span className="text-xs font-semibold text-[#2ECC87]">
                Nuevo en Espa&ntilde;a
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-[family-name:var(--font-serif)] text-4xl leading-tight text-white sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-6xl">
              Propinas digitales.{" "}
              <span className="text-[#2ECC87]">
                Sin efectivo, sin l&iacute;os.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/60 lg:mx-0">
              Tus clientes escanean un QR, dejan propina desde el m&oacute;vil y tu equipo cobra directamente en su cuenta bancaria.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <a
                href="/auth/registro-restaurante"
                className="group w-full rounded-full bg-[#2ECC87] px-8 py-4 text-center text-base font-bold text-[#0D1B1E] shadow-[0_8px_30px_rgba(46,204,135,0.3)] transition-all hover:bg-[#2ECC87]/90 hover:shadow-[0_8px_40px_rgba(46,204,135,0.45)] sm:w-auto"
              >
                Empieza gratis
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </a>
              <a
                href="#como-funciona"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-8 py-4 text-base font-medium text-white/80 transition-all hover:border-white/30 hover:text-white sm:w-auto"
              >
                &iquest;C&oacute;mo funciona?
              </a>
            </div>

            {/* Mini stats */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
              {[
                { value: "0\u20AC", label: "cuota mensual" },
                { value: "5 min", label: "listo en" },
                { value: "Stripe", label: "pagos con" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#2ECC87]">{stat.value}</span>
                  <span className="text-sm text-white/40">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ---- Phone mockup demo ---- */}
          <div className="flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </div>

      <TrustBar />
    </section>
  );
}
