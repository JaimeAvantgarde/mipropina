"use client";

import { useEffect, useRef } from "react";

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px]">
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
              <div className="h-2.5 w-2.5 rounded-full border-2 border-gray-800" />
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

          {/* App content */}
          <div className="px-5 pb-6 pt-3">
            {/* Restaurant header */}
            <div className="mb-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                <span className="text-lg">🍽</span>
              </div>
              <p className="text-[13px] font-bold text-gray-900">Restaurante El Olivo</p>
              <p className="text-[11px] text-gray-500">Mesa 7 &middot; Camarero: Pablo</p>
            </div>

            {/* Tip label */}
            <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Elige la propina
            </p>

            {/* Amount chips */}
            <div className="mb-4 grid grid-cols-4 gap-2">
              {["1", "2", "3", "5"].map((amount, i) => (
                <button
                  key={amount}
                  className={`rounded-xl py-2.5 text-center text-sm font-bold transition-all ${
                    i === 2
                      ? "bg-primary text-white shadow-[0_4px_12px_rgba(46,204,135,0.35)] scale-105"
                      : "bg-white text-gray-700 shadow-sm hover:shadow-md"
                  }`}
                >
                  {amount}&euro;
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm">
              <span className="text-sm text-gray-400">Otra cantidad:</span>
              <span className="ml-auto text-sm font-bold text-gray-800">3,00 &euro;</span>
            </div>

            {/* Pay button */}
            <button className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(46,204,135,0.4)] transition-transform hover:scale-[1.02]">
              Dejar propina &middot; 3,00 &euro;
            </button>

            {/* Security badge */}
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <svg className="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] text-gray-400">Pago seguro con Stripe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Glow effect behind phone */}
      <div className="absolute -inset-8 -z-10 rounded-full bg-primary/10 blur-3xl" />
    </div>
  );
}

function FloatingParticles() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Particles are pure CSS, no JS needed
  }, []);

  return (
    <div ref={canvasRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary/30"
          style={{
            width: `${6 + i * 3}px`,
            height: `${6 + i * 3}px`,
            left: `${15 + i * 18}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `floatParticle${i} ${8 + i * 2}s ease-in-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes floatParticle0 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          50% { transform: translate(30px, -40px) scale(1.2); opacity: 0.7; }
        }
        @keyframes floatParticle1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(-25px, -50px) scale(1.4); opacity: 0.6; }
        }
        @keyframes floatParticle2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate(40px, 30px) scale(1.1); opacity: 0.8; }
        }
        @keyframes floatParticle3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(-35px, -20px) scale(1.3); opacity: 0.5; }
        }
        @keyframes floatParticle4 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          50% { transform: translate(20px, -60px) scale(1.2); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

function TrustBar() {
  const badges = ["Visa", "Mastercard", "Apple Pay", "Google Pay", "SEPA"];

  return (
    <div className="border-t border-white/5 bg-dark/50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-4 text-center text-sm font-medium text-white/40">
          Compatible con
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {badges.map((name) => (
            <span
              key={name}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wide text-white/50 transition-colors hover:border-primary/30 hover:text-white/70"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-dark">
      <FloatingParticles />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark to-primary/10" />

      <div className="relative mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 md:pt-36 md:pb-24 lg:px-8 lg:pt-40 lg:pb-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text content */}
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="text-xs font-semibold text-primary">
                Nuevo en Espana
              </span>
            </div>

            <h1 className="font-[family-name:var(--font-serif)] text-4xl leading-tight text-white sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-6xl">
              La revolucion de las{" "}
              <span className="text-primary">
                propinas digitales
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/60 lg:mx-0">
              Tus clientes escanean, dejan propina y tu equipo cobra. Sin efectivo, sin complicaciones.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <a
                href="/auth/registro-restaurante"
                className="group w-full rounded-full bg-primary px-8 py-4 text-center text-base font-bold text-dark shadow-[0_8px_30px_rgba(46,204,135,0.3)] transition-all hover:bg-primary/90 hover:shadow-[0_8px_40px_rgba(46,204,135,0.45)] sm:w-auto"
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
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Ver demo
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center justify-center gap-6 lg:justify-start">
              <div className="flex -space-x-2">
                {["bg-blue-400", "bg-amber-400", "bg-rose-400", "bg-emerald-400"].map(
                  (color, i) => (
                    <div
                      key={i}
                      className={`h-8 w-8 rounded-full border-2 border-dark ${color} flex items-center justify-center text-[10px] font-bold text-white`}
                    >
                      {["JM", "AL", "CR", "PS"][i]}
                    </div>
                  )
                )}
              </div>
              <p className="text-sm text-white/40">
                <span className="font-semibold text-white/60">+200</span> negocios ya confian en nosotros
              </p>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </div>

      <TrustBar />
    </section>
  );
}
