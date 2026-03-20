import Link from "next/link";

export const metadata = {
  title: "Politica de cookies | mipropina.es",
  description: "Politica de cookies de mipropina.es",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5FAF7" }}>
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-[family-name:var(--font-serif)] text-xl" style={{ color: "#0D1B1E" }}>
            mi<span style={{ color: "#2ECC87" }}>propina</span>
          </Link>
          <Link href="/" className="text-sm hover:underline" style={{ color: "#0D1B1E" }}>
            Volver al inicio
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-2 font-[family-name:var(--font-serif)] text-3xl font-bold" style={{ color: "#0D1B1E" }}>
          Politica de cookies
        </h1>
        <p className="mb-10 text-sm text-gray-500">Ultima actualizacion: marzo 2026</p>

        <div className="space-y-8 text-[15px] leading-relaxed" style={{ color: "#0D1B1E" }}>
          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              1. Que son las cookies
            </h2>
            <p>
              Las cookies son pequenos archivos de texto que los sitios web almacenan en tu navegador.
              Se utilizan para recordar informacion sobre tu visita, como tus preferencias de sesion,
              y facilitar el funcionamiento del sitio.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              2. Cookies que utilizamos
            </h2>
            <p className="mb-4">
              mipropina.es solo utiliza <strong>cookies estrictamente necesarias</strong> para el
              funcionamiento del servicio. No utilizamos cookies de marketing, publicidad ni
              analitica de terceros.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2" style={{ borderColor: "#2ECC87" }}>
                    <th className="px-4 py-3 text-left font-semibold">Cookie</th>
                    <th className="px-4 py-3 text-left font-semibold">Proveedor</th>
                    <th className="px-4 py-3 text-left font-semibold">Finalidad</th>
                    <th className="px-4 py-3 text-left font-semibold">Duracion</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3 font-mono text-xs">sb-*-auth-token</td>
                    <td className="px-4 py-3">Supabase</td>
                    <td className="px-4 py-3">Sesion de autenticacion del usuario</td>
                    <td className="px-4 py-3">Sesion / 1 ano</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3 font-mono text-xs">sb-*-auth-token-code-verifier</td>
                    <td className="px-4 py-3">Supabase</td>
                    <td className="px-4 py-3">Verificacion PKCE para flujo de autenticacion seguro</td>
                    <td className="px-4 py-3">Sesion</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              3. Cookies de terceros
            </h2>
            <p>
              <strong>No utilizamos cookies de terceros.</strong> No hay cookies de Google Analytics,
              Facebook Pixel, ni de ninguna otra plataforma de publicidad o seguimiento. Tu actividad
              en mipropina.es no se rastrea con fines comerciales.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              4. Gestion de cookies
            </h2>
            <p>
              Dado que solo utilizamos cookies esenciales para el funcionamiento del servicio, no es
              necesario mostrar un banner de consentimiento de cookies. No obstante, puedes configurar
              tu navegador para bloquear o eliminar cookies. Ten en cuenta que, si bloqueas las cookies
              esenciales, es posible que no puedas acceder a tu cuenta ni usar ciertas funcionalidades
              de la Plataforma.
            </p>
            <p className="mt-3">
              Puedes gestionar las cookies desde la configuracion de tu navegador:
            </p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#2ECC87" }}>
                  Google Chrome
                </a>
              </li>
              <li>
                <a href="https://support.mozilla.org/es/kb/cookies-informacion-que-los-sitios-web-guardan-en-" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#2ECC87" }}>
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#2ECC87" }}>
                  Safari
                </a>
              </li>
              <li>
                <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#2ECC87" }}>
                  Microsoft Edge
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              5. Contacto
            </h2>
            <p>
              Si tienes alguna pregunta sobre nuestra politica de cookies, contactanos en{" "}
              <a href="mailto:contacto@mipropina.es" className="underline" style={{ color: "#2ECC87" }}>
                contacto@mipropina.es
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
