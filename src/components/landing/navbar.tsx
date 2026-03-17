"use client";

import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { label: "Como funciona", href: "#como-funciona" },
    { label: "Caracteristicas", href: "#caracteristicas" },
    { label: "Precios", href: "#precios" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-dark/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-serif)] text-xl text-white md:text-2xl">
              mi<span className="text-primary">propina</span>
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/login"
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              Acceder
            </a>
            <a
              href="/register"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-dark transition-all hover:bg-primary/90 hover:shadow-[0_4px_16px_rgba(46,204,135,0.3)]"
            >
              Empieza gratis
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            aria-label="Menu"
          >
            <span
              className={`h-0.5 w-6 rounded-full bg-white transition-all duration-300 ${
                mobileOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 rounded-full bg-white transition-all duration-300 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 rounded-full bg-white transition-all duration-300 ${
                mobileOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 bg-dark transition-all duration-300 md:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex h-full flex-col items-center justify-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="font-[family-name:var(--font-serif)] text-2xl text-white/80 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col items-center gap-4">
            <a
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="text-lg font-medium text-white/70 transition-colors hover:text-white"
            >
              Acceder
            </a>
            <a
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="rounded-full bg-primary px-8 py-3 text-lg font-semibold text-dark transition-all hover:bg-primary/90"
            >
              Empieza gratis
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
