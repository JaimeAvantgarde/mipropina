const features = [
  {
    emoji: "\uD83D\uDCF1",
    title: "QR en cada mesa",
    description:
      "Genera códigos QR únicos. El cliente escanea y deja propina en segundos.",
  },
  {
    emoji: "\uD83C\uDFE6",
    title: "Hucha digital",
    description:
      "Todas las propinas se acumulan en tu hucha virtual. Controla cada céntimo.",
  },
  {
    emoji: "\u2696\uFE0F",
    title: "Reparto justo",
    description:
      "Distribuye las propinas equitativamente o personaliza el reparto por horas.",
  },
  {
    emoji: "\uD83D\uDC65",
    title: "Gestión de equipo",
    description:
      "Invita camareros por WhatsApp. Cada uno recibe su parte directamente.",
  },
  {
    emoji: "\uD83D\uDCAC",
    title: "WhatsApp integrado",
    description:
      "Envía invitaciones y notificaciones por WhatsApp sin coste adicional.",
  },
  {
    emoji: "\uD83D\uDD12",
    title: "Pagos seguros",
    description:
      "Stripe procesa todos los pagos. PSD2, 3D Secure y cifrado de extremo a extremo.",
  },
];

export default function Features() {
  return (
    <section id="caracteristicas" className="bg-[#F5FAF7] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Características
          </span>
          <h2 className="font-[family-name:var(--font-serif)] text-3xl text-dark sm:text-4xl md:text-5xl">
            Todo lo que necesitas
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Una sola plataforma para gestionar las propinas de tu negocio de principio a fin.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-3xl transition-colors group-hover:bg-primary/20">
                {feature.emoji}
              </div>
              <h3 className="mb-2 text-lg font-bold text-dark">
                {feature.title}
              </h3>
              <p className="leading-relaxed text-gray-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
