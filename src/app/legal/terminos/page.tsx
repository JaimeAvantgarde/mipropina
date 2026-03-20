import Link from "next/link";

export const metadata = {
  title: "Terminos de servicio | mipropina.es",
  description: "Terminos y condiciones de uso de mipropina.es",
};

export default function TerminosPage() {
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
          Terminos de servicio
        </h1>
        <p className="mb-10 text-sm text-gray-500">Ultima actualizacion: marzo 2026</p>

        <div className="space-y-8 text-[15px] leading-relaxed" style={{ color: "#0D1B1E" }}>
          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              1. Objeto
            </h2>
            <p>
              mipropina.es (en adelante, &quot;la Plataforma&quot;) es un servicio de intermediacion tecnologica
              que permite a los clientes de establecimientos de hosteleria en Espana dejar propinas digitales
              a traves de codigos QR. La Plataforma facilita la conexion entre el cliente que desea dejar
              una propina y el establecimiento o camarero que la recibe.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              2. Naturaleza del servicio
            </h2>
            <p>
              mipropina.es actua exclusivamente como intermediario tecnologico. No es una entidad financiera,
              ni un servicio de pago. El procesamiento de todos los pagos se realiza a traves de{" "}
              <strong>Stripe</strong>, plataforma de pagos regulada y autorizada que cumple con la normativa
              PSD2 y los estandares PCI-DSS. mipropina.es no almacena datos de tarjetas de credito ni
              debito en ningun momento.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              3. Modelo de precios y comisiones
            </h2>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                <strong>Sin cuota mensual:</strong> el registro y uso de la Plataforma por parte del
                establecimiento no conlleva ningun coste fijo ni suscripcion.
              </li>
              <li>
                <strong>Comision por transaccion al cliente:</strong> cada propina realizada tiene un coste
                fijo de <strong>0,20 EUR</strong> que se anade al importe de la propina y es asumido por el
                cliente que deja la propina.
              </li>
              <li>
                <strong>Comision de plataforma:</strong> mipropina.es descuenta una comision del importe
                de la propina antes de transferirla al establecimiento o camarero. Esta comision cubre los
                costes operativos y de mantenimiento de la Plataforma.
              </li>
              <li>
                <strong>Comisiones de Stripe:</strong> Stripe aplica sus propias comisiones por el
                procesamiento del pago, que se detallan en{" "}
                <a
                  href="https://stripe.com/es/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: "#2ECC87" }}
                >
                  stripe.com/es/pricing
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              4. Registro y cuentas
            </h2>
            <p>
              Para utilizar la Plataforma como establecimiento, es necesario crear una cuenta proporcionando
              datos veridicos y completos. El titular de la cuenta (propietario del establecimiento) es
              responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las
              actividades que se realicen bajo su cuenta.
            </p>
            <p className="mt-3">
              El establecimiento debera completar el proceso de verificacion de identidad de Stripe Connect
              para poder recibir transferencias de las propinas recaudadas.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              5. Responsabilidades del establecimiento
            </h2>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                El establecimiento es el unico responsable de la gestion de su equipo de trabajo, incluyendo
                el alta y baja de camareros en la Plataforma.
              </li>
              <li>
                El reparto de las propinas entre los miembros del equipo es responsabilidad exclusiva del
                establecimiento. mipropina.es facilita herramientas de reparto por porcentaje, pero la
                decision final recae en el propietario.
              </li>
              <li>
                El establecimiento debe asegurar que el uso de la Plataforma cumple con la legislacion
                laboral y fiscal vigente en Espana.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              6. Responsabilidades del cliente
            </h2>
            <p>
              El cliente que deja una propina lo hace de forma voluntaria. Al confirmar el pago, acepta el
              cargo en su metodo de pago por el importe de la propina mas la comision fija de 0,20 EUR.
              Las propinas no son reembolsables salvo en casos de error tecnico demostrable.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              7. Infraestructura y disponibilidad
            </h2>
            <p>
              La Plataforma esta alojada en <strong>Vercel</strong> y utiliza <strong>Supabase</strong> como
              base de datos. Nos esforzamos por mantener el servicio disponible 24/7, pero no garantizamos
              una disponibilidad del 100%. No seremos responsables de interrupciones temporales por
              mantenimiento, actualizaciones o causas de fuerza mayor.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              8. Propiedad intelectual
            </h2>
            <p>
              Todos los contenidos de la Plataforma (diseno, textos, logotipos, codigo fuente) son propiedad
              de mipropina.es y estan protegidos por las leyes de propiedad intelectual. Queda prohibida su
              reproduccion, distribucion o modificacion sin autorizacion expresa.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              9. Limitacion de responsabilidad
            </h2>
            <p>
              mipropina.es no sera responsable de danos indirectos, incidentales o consecuentes derivados
              del uso de la Plataforma. Nuestra responsabilidad maxima se limita al importe de las comisiones
              cobradas al usuario afectado en los ultimos 12 meses.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              10. Modificaciones
            </h2>
            <p>
              Nos reservamos el derecho de modificar estos terminos en cualquier momento. Las modificaciones
              se publicaran en esta pagina y, si son sustanciales, notificaremos a los usuarios registrados
              por correo electronico. El uso continuado de la Plataforma tras la publicacion de los cambios
              implica la aceptacion de los nuevos terminos.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              11. Legislacion aplicable y jurisdiccion
            </h2>
            <p>
              Estos terminos se rigen por la legislacion espanola. Para cualquier controversia derivada del
              uso de la Plataforma, las partes se someten a los juzgados y tribunales de la ciudad de
              Granada (Espana).
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-serif)] text-xl font-semibold" style={{ color: "#0D1B1E" }}>
              12. Contacto
            </h2>
            <p>
              Para cualquier consulta relacionada con estos terminos, puedes escribirnos a{" "}
              <a
                href="mailto:contacto@mipropina.es"
                className="underline"
                style={{ color: "#2ECC87" }}
              >
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
