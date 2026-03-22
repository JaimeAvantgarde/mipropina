const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2ECC87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    title: "QR en cada mesa",
    description: "Genera un QR para tu restaurante. El cliente lo escanea con la cámara y deja propina en segundos. Sin apps, sin registro.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2ECC87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "Todo bajo control",
    description: "Ve cada propina en tiempo real desde tu panel. Cuánto entra, cuándo, y cuánto tienes para repartir.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2ECC87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
    title: "Invita al equipo",
    description: "Añade camareros con un link de WhatsApp. Cada uno tiene su perfil y puede conectar su cuenta bancaria.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2ECC87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l2.5 2.5L16 9" />
      </svg>
    ),
    title: "Reparto justo",
    description: "Reparte equitativamente o personaliza por porcentaje. El dinero llega directo al IBAN de cada persona.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2ECC87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: "Apple Pay, Google Pay, tarjeta",
    description: "El cliente paga como quiera. Stripe procesa todo con 3D Secure y cifrado de extremo a extremo.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2ECC87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Sin cuotas ni sorpresas",
    description: "0 € al mes. Solo una pequeña comisión cuando recibes propinas. Sabes lo que pagas antes de empezar.",
  },
];

export default function Features() {
  return (
    <section id="caracteristicas" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl text-[#0D1B1E] sm:text-4xl md:text-5xl">
            Todo lo que tu restaurante necesita
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            De la propina en la mesa al IBAN del camarero. Sin intermediarios, sin papeleo.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-gray-100 bg-white p-8 transition-all duration-300 hover:border-[#2ECC87]/30 hover:shadow-[0_8px_30px_rgba(46,204,135,0.08)]"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5FAF7] transition-colors group-hover:bg-[#2ECC87]/10">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-lg font-bold text-[#0D1B1E]">
                {feature.title}
              </h3>
              <p className="leading-relaxed text-gray-500 text-[15px]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
