"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  restaurantName?: string;
  restaurantEmoji?: string;
  staffRole?: string;
}

const allNavItems = [
  { emoji: "📊", label: "Vista general", href: "/dashboard", ownerOnly: false },
  { emoji: "👥", label: "Equipo", href: "/dashboard/equipo", ownerOnly: false },
  { emoji: "⚙️", label: "Ajustes", href: "/dashboard/ajustes", ownerOnly: true },
];

function Sidebar({ isOpen, onToggle, restaurantName, restaurantEmoji, staffRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isOwner = staffRole === "owner";
  const navItems = allNavItems.filter((item) => !item.ownerOnly || isOwner);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-[#0D1B1E] flex flex-col transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="px-6 pt-8 pb-2 mb-8">
          <Link href="/dashboard" className="block">
            <h1 className="text-2xl text-white font-[family-name:var(--font-serif)]">
              mipropina
            </h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={cn(
                    "flex items-center gap-3 py-3 px-4 rounded-[10px] text-[15px] font-medium transition-colors duration-150",
                    isActive(item.href)
                      ? "text-[#2ECC87] bg-[rgba(46,204,135,0.1)]"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <span className="text-lg">{item.emoji}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="px-6 pb-8 border-t border-white/10 pt-6 mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#2ECC87]/20 flex items-center justify-center text-lg">
              {restaurantEmoji || "🍽️"}
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">
                {restaurantName || "Mi Restaurante"}
              </p>
              <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-[#2ECC87] bg-[#2ECC87]/10 px-2 py-0.5 rounded-full">
                {staffRole === "owner" ? "Gerente" : "Camarero"}
              </span>
            </div>
          </div>
          <button
            className="text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors cursor-pointer"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}

export { Sidebar };
