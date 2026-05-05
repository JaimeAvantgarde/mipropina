import Link from "next/link";

export const metadata = {
  title: "Politica de privacidad | mipropina.es",
  description: "Politica de privacidad y proteccion de datos de mipropina.es",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5FAF7" }}>
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" aria-label="mipropina">
            <img
              src="/logos/mipropina-logo-verde-transparente.svg"
              alt="mipropina"
              className="h-12 w-auto"
            />
          </Link>
          <Link href="/" className="text-sm hover:underline" style={{ color: "#0D1B1E" }}>
            Volver al inicio
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-2 font-[family-name:var(--font-serif)] text-3xl font-bold" style={{ color: "#0D1B1E" }}>
          Politica de privacidad
        </h1>
        <p className="mb-10 text-sm text-gray-500">Ultima actualizacion: marzo 2026</p>

        <div className="space-y-8 text-[15px] leading-relaxed" style={{ color: "#0D1B1E" }}>
          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              1. Responsable del tratamiento
            </h2>
            <ul className="ml-4 list-disc space-y-1">
              <li><strong>Identidad:</strong> mipropina.es</li>
              <li><strong>Correo electronico:</strong>{" "}
                <a href="mailto:contacto@mipropina.es" className="underline" style={{ color: "#2ECC87" }}>
                  contacto@mipropina.es
                </a>
              </li>
              <li><strong>Sitio web:</strong> https://mipropina.es</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              2. Datos personales que recogemos
            </h2>
            <p className="mb-3">Dependiendo del tipo de usuario, recogemos los siguientes datos:</p>
            <h3 className="mb-2 font-semibold">Propietarios de establecimientos:</h3>
            <ul className="ml-4 mb-4 list-disc space-y-1">
              <li>Nombre y apellidos</li>
              <li>Correo electronico</li>
              <li>Telefono de contacto</li>
              <li>Nombre del establecimiento</li>
            </ul>
            <h3 className="mb-2 font-semibold">Camareros / miembros del equipo:</h3>
            <ul className="ml-4 mb-4 list-disc space-y-1">
              <li>Nombre y apellidos</li>
              <li>Correo electronico</li>
              <li>IBAN (para recibir propinas directamente)</li>
            </ul>
            <h3 className="mb-2 font-semibold">Clientes que dejan propinas:</h3>
            <ul className="ml-4 list-disc space-y-1">
              <li>No recogemos datos personales de los clientes. El pago se procesa directamente a traves de Stripe sin que mipropina.es almacene datos de tarjeta.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              3. Finalidad del tratamiento
            </h2>
            <ul className="ml-4 list-disc space-y-2">
              <li><strong>Gestion de cuentas:</strong> creacion y mantenimiento de la cuenta del establecimiento y sus miembros.</li>
              <li><strong>Procesamiento de propinas:</strong> facilitar la recepcion y reparto de propinas digitales.</li>
              <li><strong>Pagos:</strong> gestion de transferencias a traves de Stripe Connect.</li>
              <li><strong>Comunicaciones:</strong> envio de notificaciones relacionadas con el servicio (confirmaciones, alertas de pago, etc.).</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              4. Base juridica del tratamiento
            </h2>
            <ul className="ml-4 list-disc space-y-2">
              <li><strong>Ejecucion de contrato:</strong> el tratamiento es necesario para la prestacion del servicio contratado (art. 6.1.b RGPD).</li>
              <li><strong>Consentimiento:</strong> para comunicaciones no esenciales, solicitaremos tu consentimiento previo (art. 6.1.a RGPD).</li>
              <li><strong>Interes legitimo:</strong> para la mejora del servicio y prevencion de fraude (art. 6.1.f RGPD).</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              5. Procesadores de datos y terceros
            </h2>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                <strong>Stripe (Stripe Payments Europe, Ltd.):</strong> procesador de pagos. Stripe trata
                los datos de pago conforme a su propia politica de privacidad y cumple con PCI-DSS.
                mipropina.es no almacena datos de tarjetas de credito ni debito.
              </li>
              <li>
                <strong>Supabase (Supabase Inc.):</strong> proveedor de base de datos donde se almacenan
                los datos de cuentas y transacciones. Los datos se alojan en servidores de la UE.
              </li>
              <li>
                <strong>Vercel (Vercel Inc.):</strong> proveedor de hosting de la aplicacion web.
              </li>
            </ul>
            <p className="mt-3">
              No vendemos ni compartimos datos personales con terceros con fines comerciales o publicitarios.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              6. Conservacion de datos
            </h2>
            <p>
              Los datos personales se conservaran mientras la cuenta este activa y durante el periodo
              legalmente exigido para cumplir obligaciones fiscales y legales. Una vez eliminada la cuenta,
              los datos se suprimiran en un plazo maximo de 30 dias, salvo obligacion legal de conservacion.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              7. Derechos del interesado (derechos ARCO)
            </h2>
            <p className="mb-3">
              De acuerdo con el Reglamento General de Proteccion de Datos (RGPD) y la Ley Organica 3/2018
              de Proteccion de Datos (LOPDGDD), tienes derecho a:
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li><strong>Acceso:</strong> conocer que datos personales tenemos sobre ti.</li>
              <li><strong>Rectificacion:</strong> corregir datos inexactos o incompletos.</li>
              <li><strong>Cancelacion / supresion:</strong> solicitar la eliminacion de tus datos cuando ya no sean necesarios.</li>
              <li><strong>Oposicion:</strong> oponerte al tratamiento de tus datos en determinadas circunstancias.</li>
              <li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado y de uso comun.</li>
              <li><strong>Limitacion:</strong> solicitar la limitacion del tratamiento en determinados supuestos.</li>
            </ul>
            <p className="mt-3">
              Para ejercer cualquiera de estos derechos, envia un correo a{" "}
              <a href="mailto:contacto@mipropina.es" className="underline" style={{ color: "#2ECC87" }}>
                contacto@mipropina.es
              </a>{" "}
              indicando tu nombre, correo asociado a la cuenta y el derecho que deseas ejercer. Responderemos
              en un plazo maximo de 30 dias.
            </p>
            <p className="mt-3">
              Si consideras que tus derechos no han sido debidamente atendidos, puedes presentar una
              reclamacion ante la{" "}
              <a
                href="https://www.aepd.es"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: "#2ECC87" }}
              >
                Agencia Espanola de Proteccion de Datos (AEPD)
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              8. Cookies
            </h2>
            <p>
              mipropina.es solo utiliza cookies esenciales para el funcionamiento del servicio (sesion de
              autenticacion). No utilizamos cookies de marketing, publicidad ni analitica de terceros.
              Puedes consultar mas detalles en nuestra{" "}
              <Link href="/legal/cookies" className="underline" style={{ color: "#2ECC87" }}>
                politica de cookies
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              9. Seguridad
            </h2>
            <p>
              Implementamos medidas tecnicas y organizativas para proteger tus datos personales contra
              accesos no autorizados, perdida o destruccion. Todas las comunicaciones se realizan a traves
              de conexiones cifradas (HTTPS/TLS).
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              10. Contacto
            </h2>
            <p>
              Para cualquier consulta relacionada con la privacidad de tus datos, puedes escribirnos a{" "}
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
