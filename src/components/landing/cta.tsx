export default function CTA() {
  return (
    <section id="precios" className="bg-[#F5FAF7] px-4 py-20 md:py-28">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center shadow-[0_20px_60px_rgba(46,204,135,0.3)] sm:px-12 md:py-20">
        {/* Background decoration */}
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-xl" />

        <div className="relative">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl text-white sm:text-4xl md:text-5xl">
            Empieza a recibir propinas digitales hoy
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-lg text-white/80">
            Registro gratuito. Sin cuotas mensuales. Solo pagas cuando recibes propinas.
          </p>

          <a
            href="/auth/registro-restaurante"
            className="group mt-8 inline-flex items-center rounded-full bg-white px-10 py-4 text-lg font-bold text-dark shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
          >
            Crear mi cuenta gratis
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </a>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-white/70">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Sin tarjeta de crédito
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Listo en 5 minutos
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Soporte incluido
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
