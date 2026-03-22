"use client";

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    title: "QR en cada mesa",
    description: "El cliente escanea con la cámara y deja propina en segundos. Sin apps, sin registro.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "Todo bajo control",
    description: "Ve cada propina en tiempo real. Cuánto entra, cuándo, y cuánto tienes para repartir.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
    title: "Invita al equipo",
    description: "Añade camareros con un link de WhatsApp. Cada uno conecta su cuenta bancaria.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l2.5 2.5L16 9" />
      </svg>
    ),
    title: "Reparto justo",
    description: "Equitativo o por porcentaje. El dinero llega directo al IBAN de cada persona.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: "Apple Pay, Google Pay, tarjeta",
    description: "Stripe procesa todo con 3D Secure y cifrado de extremo a extremo.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Sin cuotas ni sorpresas",
    description: "0 € al mes. Solo una pequeña comisión cuando recibes propinas.",
  },
];

export default function Features() {
  return (
    <section id="caracteristicas" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center md:mb-20">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl text-[#0D1B1E] sm:text-4xl md:text-5xl">
            Todo lo que tu restaurante necesita
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            De la propina en la mesa al IBAN del camarero. Sin intermediarios, sin papeleo.
          </p>
        </div>

        {/* Alternating rows */}
        <div className="space-y-0">
          {/* Row 1 — Left image, right features */}
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20 py-12 md:py-16">
            {/* Visual: Phone tipping mockup */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-[280px] rounded-3xl bg-[#F5FAF7] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
                  {/* Mini restaurant header */}
                  <div className="text-center mb-5">
                    <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-[#2ECC87]/10 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2ECC87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-[#0D1B1E]">La Tasca de María</p>
                  </div>
                  {/* Amounts */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {["2", "5", "10", "20"].map((a, i) => (
                      <div key={a} className={`rounded-xl py-3 text-center text-sm font-bold ${i === 1 ? "bg-[#2ECC87] text-white shadow-[0_4px_12px_rgba(46,204,135,0.3)]" : "bg-white text-gray-600 shadow-sm"}`}>
                        {a}&euro;
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-[#2ECC87] py-3.5 text-center text-sm font-bold text-white shadow-[0_6px_20px_rgba(46,204,135,0.35)]">
                    Dejar propina &middot; 5,00 &euro;
                  </div>
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <span className="text-[10px] text-gray-400 font-medium">Apple Pay</span>
                    <span className="text-[10px] text-gray-300">&middot;</span>
                    <span className="text-[10px] text-gray-400 font-medium">Google Pay</span>
                    <span className="text-[10px] text-gray-300">&middot;</span>
                    <span className="text-[10px] text-gray-400 font-medium">Tarjeta</span>
                  </div>
                </div>
                {/* Decorative glow */}
                <div className="absolute -inset-4 -z-10 rounded-3xl bg-[#2ECC87]/5 blur-xl" />
              </div>
            </div>

            {/* Features list */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#2ECC87] mb-4">Para el cliente</p>
              <h3 className="font-[family-name:var(--font-serif)] text-2xl text-[#0D1B1E] mb-6 sm:text-3xl">
                Paga en 10 segundos
              </h3>
              <div className="space-y-5">
                {features.slice(0, 2).map((f) => (
                  <div key={f.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F5FAF7] flex items-center justify-center flex-shrink-0 text-[#2ECC87]">
                      {f.icon}
                    </div>
                    <div>
                      <p className="font-bold text-[#0D1B1E] mb-0.5">{f.title}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5FAF7] flex items-center justify-center flex-shrink-0 text-[#2ECC87]">
                    {features[4].icon}
                  </div>
                  <div>
                    <p className="font-bold text-[#0D1B1E] mb-0.5">{features[4].title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{features[4].description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-auto w-16 h-px bg-gray-200" />

          {/* Row 2 — Right image, left features */}
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20 py-12 md:py-16">
            {/* Features list */}
            <div className="order-2 lg:order-1">
              <p className="text-xs font-bold uppercase tracking-widest text-[#2ECC87] mb-4">Para el gerente</p>
              <h3 className="font-[family-name:var(--font-serif)] text-2xl text-[#0D1B1E] mb-6 sm:text-3xl">
                Gestiona y reparte
              </h3>
              <div className="space-y-5">
                {features.slice(2, 4).map((f) => (
                  <div key={f.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F5FAF7] flex items-center justify-center flex-shrink-0 text-[#2ECC87]">
                      {f.icon}
                    </div>
                    <div>
                      <p className="font-bold text-[#0D1B1E] mb-0.5">{f.title}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5FAF7] flex items-center justify-center flex-shrink-0 text-[#2ECC87]">
                    {features[5].icon}
                  </div>
                  <div>
                    <p className="font-bold text-[#0D1B1E] mb-0.5">{features[5].title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{features[5].description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual: Dashboard mockup */}
            <div className="flex justify-center order-1 lg:order-2">
              <div className="relative">
                <div className="w-[320px] rounded-3xl bg-[#F5FAF7] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
                  {/* Mini dashboard */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-[#0D1B1E]">Vista general</p>
                    <span className="text-[10px] font-bold text-[#2ECC87] bg-[#2ECC87]/10 px-2 py-0.5 rounded-full">Gerente</span>
                  </div>

                  {/* Mini stat cards */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-[10px] text-gray-400 mb-0.5">Total</p>
                      <p className="text-lg font-bold text-[#0D1B1E]">247,50 &euro;</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-[10px] text-gray-400 mb-0.5">Esta semana</p>
                      <p className="text-lg font-bold text-[#0D1B1E]">12</p>
                    </div>
                  </div>

                  {/* Mini chart */}
                  <div className="bg-white rounded-xl p-3 shadow-sm mb-4">
                    <p className="text-[10px] text-gray-400 mb-2">Actividad</p>
                    <div className="flex items-end gap-[3px] h-10">
                      {[30, 60, 20, 80, 45, 90, 55, 70, 40, 85, 50, 95, 65, 100].map((h, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-t-sm ${i === 13 ? "bg-[#0D1B1E]" : "bg-[#2ECC87]"}`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Mini team */}
                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <p className="text-[10px] text-gray-400 mb-2">Equipo</p>
                    <div className="space-y-2">
                      {[
                        { name: "María L.", role: "Gerente", color: "bg-rose-400" },
                        { name: "Pedro R.", role: "Camarero", color: "bg-blue-400" },
                        { name: "Ana G.", role: "Camarera", color: "bg-amber-400" },
                      ].map((p) => (
                        <div key={p.name} className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full ${p.color} flex items-center justify-center text-[8px] font-bold text-white`}>
                            {p.name.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-[#0D1B1E] flex-1">{p.name}</span>
                          <span className="text-[9px] text-gray-400">{p.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Decorative glow */}
                <div className="absolute -inset-4 -z-10 rounded-3xl bg-[#2ECC87]/5 blur-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
