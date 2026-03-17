const steps = [
  {
    number: "1",
    emoji: "\uD83D\uDCF7",
    title: "El cliente escanea",
    description:
      "Un QR en la mesa. Sin apps, sin registro. Se abre directamente en el navegador.",
  },
  {
    number: "2",
    emoji: "\uD83D\uDCB0",
    title: "Elige la propina",
    description:
      "Desde 1\u20AC hasta lo que quiera. Pago seguro con tarjeta, Apple Pay o Google Pay.",
  },
  {
    number: "3",
    emoji: "\uD83C\uDF89",
    title: "Tu equipo cobra",
    description:
      "Las propinas se acumulan y tu decides como repartirlas. Transferencia SEPA directa al IBAN.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Proceso
          </span>
          <h2 className="font-[family-name:var(--font-serif)] text-3xl text-dark sm:text-4xl md:text-5xl">
            Como funciona?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Tres pasos. Sin fricciones. Sin complicaciones.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid gap-12 md:grid-cols-3 md:gap-8">
          {/* Connecting line (desktop only) */}
          <div className="absolute left-[16.67%] right-[16.67%] top-[3.5rem] z-0 hidden md:block">
            <div className="h-[2px] w-full border-t-2 border-dashed border-primary/30" />
          </div>

          {steps.map((step, i) => (
            <div key={step.number} className="relative z-10 text-center">
              {/* Number circle */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white shadow-[0_8px_24px_rgba(46,204,135,0.35)]">
                {step.number}
              </div>

              {/* Emoji */}
              <div className="mb-4 text-4xl">{step.emoji}</div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-bold text-dark">
                {step.title}
              </h3>
              <p className="mx-auto max-w-xs leading-relaxed text-gray-500">
                {step.description}
              </p>

              {/* Vertical arrow between steps (mobile only) */}
              {i < steps.length - 1 && (
                <div className="mx-auto mt-8 flex justify-center md:hidden">
                  <svg
                    className="h-8 w-8 text-primary/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
