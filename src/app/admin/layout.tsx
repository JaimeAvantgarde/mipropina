import Link from "next/link";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata = {
  title: "Admin — mipropina",
  robots: { index: false, follow: false },
};

// The middleware (src/middleware.ts) already gates /admin/* behind a valid
// admin cookie and routes unauthenticated requests to /admin/login. Here we
// only decide whether to wrap children in the chrome (header + logout). When
// there is no admin session, the only reachable page under this layout is the
// login form itself, so we render it bare.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminSession();

  if (!admin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Panel de administración
              </h1>
              <p className="text-sm text-gray-500">mipropina.es</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:inline">
              {admin.user}
            </span>
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
