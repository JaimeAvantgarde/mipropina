import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-serif text-dark mb-4">404</h1>
        <p className="text-xl text-foreground/80 mb-8">Página no encontrada</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-primary text-[#0D1B1E] font-bold py-3 px-7 rounded-[14px] text-[15px] shadow-[var(--shadow-primary)] hover:shadow-[var(--shadow-primary-lg)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
