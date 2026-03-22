export default function CTA() {
  return (
    <section id="precios" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Pricing */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl text-[#0D1B1E] sm:text-4xl md:text-5xl">
            Precio transparente
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Sin cuotas mensuales. Sin permanencia. Solo pagas cuando recibes propinas.
          </p>
        </div>

        {/* Price card */}
        <div className="mx-auto max-w-md">
          <div className="relative rounded-3xl border-2 border-[#2ECC87] bg-white p-8 shadow-[0_8px_40px_rgba(46,204,135,0.12)]">
            {/* Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-[#2ECC87] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                Sin compromiso
              </span>
            </div>

            <div className="text-center mb-6 pt-2">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl font-[family-name:var(--font-serif)] text-[#0D1B1E]">0</span>
                <span className="text-2xl font-bold text-[#0D1B1E]">&euro;/mes</span>
              </div>
              <p className="text-gray-500 mt-2">Comisión por propina recibida:</p>
              <p className="text-sm text-[#0D1B1E] font-semibold mt-1">
                0,20 &euro; al cliente + comisión de la plataforma
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {[
                "Dashboard en tiempo real",
                "QR personalizado descargable",
                "Gestión de equipo ilimitada",
                "Reparto equitativo o por %",
                "Apple Pay, Google Pay, tarjeta",
                "Transferencia SEPA directa",
                "Soporte por WhatsApp",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#2ECC87] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>

            <a
              href="/auth/registro-restaurante"
              className="group flex items-center justify-center w-full rounded-full bg-[#2ECC87] px-8 py-4 text-base font-bold text-[#0D1B1E] shadow-[0_8px_24px_rgba(46,204,135,0.3)] transition-all hover:shadow-[0_8px_32px_rgba(46,204,135,0.45)] hover:scale-[1.02]"
            >
              Crear mi cuenta gratis
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </a>
          </div>
        </div>

        {/* FAQ mini */}
        <div className="mx-auto max-w-2xl mt-16">
          <h3 className="font-bold text-[#0D1B1E] text-center text-lg mb-6">Preguntas frecuentes</h3>
          <div className="space-y-4">
            {[
              {
                q: "¿El cliente necesita descargar una app?",
                a: "No. Escanea el QR con la cámara del móvil y se abre directamente en el navegador. Sin registro, sin descargas.",
              },
              {
                q: "¿Cuánto tarda en llegar el dinero?",
                a: "Las propinas llegan a tu cuenta de Stripe en 1-2 días laborables. Desde ahí se transfieren al IBAN por SEPA.",
              },
              {
                q: "¿Puedo probarlo antes de usarlo con clientes?",
                a: "Sí. Regístrate, crea tu restaurante y escanea tu propio QR para ver cómo funciona. Puedes hacer una propina de prueba.",
              },
              {
                q: "¿Qué pasa si un camarero no tiene cuenta bancaria española?",
                a: "Stripe acepta cuentas bancarias de toda la zona SEPA (Europa). El camarero conecta su IBAN desde su perfil.",
              },
            ].map((faq) => (
              <div key={faq.q} className="bg-[#F5FAF7] rounded-2xl p-5">
                <p className="font-semibold text-[#0D1B1E] text-sm">{faq.q}</p>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm">
            ¿Tienes más preguntas? Escríbenos a{" "}
            <a href="mailto:contacto@mipropina.es" className="text-[#2ECC87] hover:underline font-medium">
              contacto@mipropina.es
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
