"use client";

import { useState, useEffect, useCallback } from "react";
import QRCodeLib from "qrcode";

const SAMPLE_TIP_URL = "https://mipropina.es/t/la-tasca-de-maria?mesa=Mesa%204";

function SampleQRCode({ className = "", width = 320 }: { className?: string; width?: number }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCodeLib.toDataURL(SAMPLE_TIP_URL, {
      width,
      margin: 2,
      color: { dark: "#0D1B1E", light: "#FFFFFF" },
    })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [width]);

  if (!qrDataUrl) {
    return <div className={`animate-pulse rounded-2xl bg-gray-100 ${className}`} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={qrDataUrl}
      alt="QR de ejemplo para dejar propina en La Tasca de Maria, Mesa 4"
      className={className}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Phone demo                                                         */
/* ------------------------------------------------------------------ */

function ScreenScan() {
  return (
    <div className="flex h-full flex-col px-5 py-5">
      <div className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0D1B1E] text-lg font-bold text-[#2ECC87]">
            M
          </div>
          <div>
            <p className="text-[13px] font-bold text-gray-900">La Tasca de Mar&iacute;a</p>
            <p className="text-[11px] text-gray-400">Mesa 4</p>
          </div>
        </div>
        <div className="pt-5 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            QR real de mesa
          </p>
          <SampleQRCode className="mx-auto mt-3 h-36 w-36 rounded-2xl" width={260} />
          <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
            Escaneado con la c&aacute;mara del m&oacute;vil. Sin app, sin registro.
          </p>
        </div>
      </div>

      <div className="mt-auto rounded-2xl bg-[#EAFBF3] px-4 py-3">
        <p className="text-[11px] font-semibold text-[#0D1B1E]">Siguiente paso</p>
        <p className="mt-1 text-[12px] text-[#1A3C34]/70">Elegir importe y pagar con Stripe.</p>
      </div>
    </div>
  );
}

function ScreenChoose() {
  const amounts = [2, 5, 10, 20];
  const selected = 5;

  return (
    <div className="flex h-full flex-col px-5 py-5">
      <div className="mb-5 rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D1B1E] text-lg font-bold text-[#2ECC87]">
            M
          </div>
          <div>
            <p className="text-[13px] font-bold text-gray-900">La Tasca de Mar&iacute;a</p>
            <p className="text-[11px] text-gray-400">Mesa 4</p>
          </div>
          <span className="ml-auto rounded-full bg-[#EAFBF3] px-2.5 py-1 text-[10px] font-bold text-[#1A3C34]">
            Abierto
          </span>
        </div>
      </div>

      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-gray-400">
        Elige la propina
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        {amounts.map((a) => (
          <div
            key={a}
            className={`rounded-2xl py-4 text-center text-base font-bold transition-all ${
              a === selected
                ? "scale-[1.02] bg-[#2ECC87] text-[#0D1B1E] shadow-[0_14px_28px_rgba(46,204,135,0.25)]"
                : "bg-white text-gray-700 shadow-sm ring-1 ring-gray-900/5"
            }`}
          >
            {a}&euro;
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-900/5">
        <span className="text-[12px] text-gray-500">Otra cantidad</span>
        <span className="ml-auto text-[12px] font-bold text-gray-300">0,00 &euro;</span>
      </div>

      <div className="mt-auto rounded-2xl bg-[#0D1B1E] px-4 py-3">
        <div className="flex items-center justify-between text-[12px] text-white/60">
          <span>Propina</span>
          <span>5,00 &euro;</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[12px] text-white/60">
          <span>Coste de servicio</span>
          <span>0,20 &euro;</span>
        </div>
        <div className="mt-3 border-t border-white/10 pt-3">
          <div className="rounded-2xl bg-[#2ECC87] py-3 text-center text-sm font-bold text-[#0D1B1E] shadow-[0_12px_24px_rgba(46,204,135,0.35)]">
            Dejar propina &middot; 5,20 &euro;
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenDone() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-5 py-8 text-center">
      <div className="mb-5 flex h-24 w-24 animate-[scaleIn_0.5s_ease-out] items-center justify-center rounded-full bg-[#2ECC87]/15">
        <svg
          className="h-12 w-12 text-[#2ECC87]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <p className="text-lg font-bold text-gray-900">&iexcl;Gracias por tu propina!</p>
      <p className="mt-2 max-w-[210px] text-sm leading-relaxed text-gray-500">
        El equipo de La Tasca de Mar&iacute;a la ha recibido correctamente.
      </p>
      <div className="mt-7 w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-900/5">
        <div className="flex items-center justify-between text-sm font-bold text-gray-900">
          <span>Total pagado</span>
          <span>5,20 &euro;</span>
        </div>
        <p className="mt-1 text-[11px] text-gray-400">Pago seguro procesado por Stripe</p>
      </div>
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

  return (
    <div className="relative mx-auto w-[calc(100vw-48px)] max-w-[320px] sm:w-[320px]">
      <div className="aspect-[9/19.5] rounded-[3rem] border-[8px] border-[#101316] bg-[#101316] p-2 shadow-[0_36px_90px_rgba(0,0,0,0.45)]">
        <div className="relative">
          <div className="absolute left-1/2 top-0 z-10 h-7 w-32 -translate-x-1/2 rounded-b-[1.4rem] bg-[#101316]" />
        </div>

        <div className="flex h-full flex-col overflow-hidden rounded-[2.35rem] bg-[#F5FAF7]">
          <div className="flex items-center justify-between bg-white px-7 pb-3 pt-9">
            <span className="text-[11px] font-semibold text-gray-900">9:41</span>
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

          <div className="relative flex-1">
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

          <div className="flex items-center justify-center gap-1.5 bg-[#F5FAF7] pb-5">
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

      <div className="absolute -inset-8 -z-10 rounded-full bg-[#2ECC87]/10 blur-3xl" />

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

function QRStand() {
  return (
    <div className="w-[220px] rounded-[1.75rem] bg-white p-5 text-center shadow-[0_24px_70px_rgba(0,0,0,0.24)] ring-1 ring-black/5 sm:w-[250px]">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D1B1E] text-lg font-bold text-[#2ECC87]">
        M
      </div>
      <p className="font-[family-name:var(--font-serif)] text-2xl leading-tight text-[#0D1B1E]">
        Deja una propina digital
      </p>
      <p className="mt-2 text-xs leading-relaxed text-gray-500">
        Escanea el QR de tu mesa y paga en segundos.
      </p>
      <div className="my-5 rounded-[1.25rem] bg-[#F5FAF7] p-3">
        <SampleQRCode className="h-full w-full rounded-xl" width={360} />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2ECC87]">
        Mesa 4
      </p>
      <p className="mt-2 break-all font-mono text-[10px] leading-tight text-gray-400">
        mipropina.es/t/la-tasca-de-maria
      </p>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto flex w-full max-w-[620px] flex-col items-center justify-center pb-6 pt-4 lg:flex-row lg:justify-end">
      <div className="absolute left-0 top-16 z-10 hidden rotate-[-4deg] lg:block">
        <QRStand />
      </div>
      <div className="absolute right-2 top-6 hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left backdrop-blur-md lg:block">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
          Hoy
        </p>
        <p className="mt-1 text-2xl font-bold text-white">128,40 &euro;</p>
        <p className="text-xs text-white/40">24 propinas recibidas</p>
      </div>
      <div className="relative z-20">
        <PhoneMockup />
      </div>
      <div className="mt-8 lg:hidden">
        <QRStand />
      </div>
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(46,204,135,0.16),transparent_34%),linear-gradient(135deg,#0D1B1E_0%,#122B2C_50%,#101316_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#F5FAF7] to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-28 sm:px-6 md:pt-32 lg:px-8 lg:pb-20 lg:pt-36">
        <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2ECC87]/20 bg-[#2ECC87]/10 px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#2ECC87]" />
              <span className="text-xs font-semibold text-[#2ECC87]">
                Propinas por QR para hosteler&iacute;a
              </span>
            </div>

            <h1 className="font-[family-name:var(--font-serif)] text-4xl leading-tight text-white sm:text-5xl md:text-6xl lg:text-[3.65rem] xl:text-[4.25rem]">
              Propinas digitales para restaurantes que quieren{" "}
              <span className="text-[#2ECC87]">
                cobrar mejor.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70 lg:mx-0">
              Tus clientes escanean un QR real de mesa, eligen el importe desde el m&oacute;vil y tu equipo ve cada propina en el panel.
            </p>

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

            <div className="mt-10 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3 lg:mx-0">
              {[
                { value: "0\u20AC", label: "cuota mensual" },
                { value: "Listo en", label: "5 min" },
                { value: "Stripe", label: "pagos seguros" },
              ].map((stat) => (
                <div
                  key={`${stat.value}-${stat.label}`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left backdrop-blur-sm"
                >
                  <span className="block text-sm font-medium text-white/40">{stat.value}</span>
                  <span className="mt-1 block text-xl font-bold text-[#2ECC87]">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <HeroVisual />
        </div>
      </div>

      <TrustBar />
    </section>
  );
}
