"use client";

const steps = [
  {
    number: "1",
    title: "Pon el QR en las mesas",
    description: "Genera tu QR desde el panel y descárgalo. Imprímelo o ponlo en un soporte. Listo.",
    visual: (
      <div className="relative w-full aspect-square max-w-[180px] mx-auto">
        <div className="absolute inset-0 bg-[#2ECC87]/5 rounded-3xl" />
        <div className="absolute inset-4 bg-white rounded-2xl shadow-sm flex items-center justify-center">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#0D1B1E" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <circle cx="17.5" cy="17.5" r="3.5" fill="#2ECC87" stroke="none" />
            <path d="M16 17.5l1 1 2.5-2.5" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    ),
  },
  {
    number: "2",
    title: "El cliente paga en 10 segundos",
    description: "Escanea, elige cuánto dejar, y paga con tarjeta, Apple Pay o Google Pay. Sin descargar nada.",
    visual: (
      <div className="relative w-full max-w-[180px] mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
          <div className="grid grid-cols-4 gap-1.5">
            {["2", "5", "10", "20"].map((amt, i) => (
              <div key={amt} className={`rounded-lg py-2 text-center text-xs font-bold ${i === 1 ? "bg-[#2ECC87] text-white" : "bg-gray-100 text-gray-600"}`}>
                {amt}&euro;
              </div>
            ))}
          </div>
          <div className="bg-[#2ECC87] rounded-xl py-2.5 text-center text-xs font-bold text-white">
            Dejar propina &middot; 5,00 &euro;
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-[9px] text-gray-400 font-medium">Apple Pay</span>
            <span className="text-gray-300">&middot;</span>
            <span className="text-[9px] text-gray-400 font-medium">Google Pay</span>
            <span className="text-gray-300">&middot;</span>
            <span className="text-[9px] text-gray-400 font-medium">Tarjeta</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "3",
    title: "Reparte al equipo",
    description: "Las propinas se acumulan en tu panel. Decide a quién repartir, cuánto, y el dinero llega a su IBAN.",
    visual: (
      <div className="relative w-full max-w-[180px] mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
          {[
            { name: "María L.", amount: "12,50 €", color: "bg-rose-400" },
            { name: "Pedro R.", amount: "12,50 €", color: "bg-blue-400" },
            { name: "Ana G.", amount: "12,50 €", color: "bg-amber-400" },
          ].map((person) => (
            <div key={person.name} className="flex items-center gap-2.5 py-1">
              <div className={`w-7 h-7 rounded-full ${person.color} flex items-center justify-center text-[9px] font-bold text-white`}>
                {person.name.charAt(0)}
              </div>
              <span className="text-xs font-medium text-gray-700 flex-1">{person.name}</span>
              <span className="text-xs font-bold text-[#2ECC87]">{person.amount}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
            <span className="text-[10px] text-gray-400">Total repartido</span>
            <span className="text-xs font-bold text-[#0D1B1E]">37,50 €</span>
          </div>
        </div>
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-[#F5FAF7] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl text-[#0D1B1E] sm:text-4xl md:text-5xl">
            Tres pasos. Cero complicaciones.
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Configura tu restaurante en 5 minutos y empieza a recibir propinas hoy mismo.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="absolute top-1/2 -right-3 w-6 h-[2px] bg-[#2ECC87]/20 hidden md:block" />
              )}

              <div className="bg-white rounded-3xl p-8 h-full flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                {/* Step number */}
                <div className="w-10 h-10 rounded-full bg-[#2ECC87] text-white text-lg font-bold flex items-center justify-center mb-6 shadow-[0_4px_12px_rgba(46,204,135,0.3)]">
                  {step.number}
                </div>

                {/* Visual */}
                <div className="mb-6 w-full">
                  {step.visual}
                </div>

                {/* Content */}
                <h3 className="mb-2 text-xl font-bold text-[#0D1B1E]">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-[15px] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
