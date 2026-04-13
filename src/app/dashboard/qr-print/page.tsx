"use client";

import { useState, useEffect } from "react";
import QRCodeLib from "qrcode";
import { useDashboard } from "@/lib/dashboard-context";

export default function QRPrintPage() {
  const { data, loading } = useDashboard();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [tableLabel, setTableLabel] = useState("");

  const restaurant = data?.restaurant;
  const tipUrl = restaurant
    ? `${typeof window !== "undefined" ? window.location.origin : "https://mipropina.es"}/t/${restaurant.slug}${tableLabel ? `?mesa=${encodeURIComponent(tableLabel)}` : ""}`
    : "";

  useEffect(() => {
    if (!tipUrl) return;
    QRCodeLib.toDataURL(tipUrl, {
      width: 400,
      margin: 2,
      color: { dark: "#0D1B1E", light: "#FFFFFF" },
    })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [tipUrl]);

  if (loading || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2ECC87] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Controls — hidden when printing */}
      <div className="no-print bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Etiqueta (opcional):</label>
          <input
            type="text"
            value={tableLabel}
            onChange={(e) => setTableLabel(e.target.value)}
            placeholder="Mesa 1, Barra, Terraza..."
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-[#2ECC87] outline-none"
          />
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#0D1B1E] text-white text-sm font-bold rounded-xl hover:bg-[#1A3C34] transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Imprimir
        </button>
      </div>

      {/* Printable card */}
      <div className="flex items-center justify-center p-12">
        <div
          className="qr-container border-2 border-gray-100 rounded-3xl p-10 text-center max-w-sm w-full shadow-sm"
          style={{ borderColor: restaurant.theme_color + "40" }}
        >
          {/* Restaurant logo */}
          <div className="mb-6">
            {restaurant.logo_url ? (
              <img
                src={restaurant.logo_url}
                alt={restaurant.name}
                className="w-20 h-20 rounded-2xl object-cover mx-auto shadow-sm"
              />
            ) : (
              <div className="text-6xl">{restaurant.logo_emoji || "🍽️"}</div>
            )}
          </div>

          {/* Name */}
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: "#0D1B1E", fontFamily: "Georgia, serif" }}
          >
            {restaurant.name}
          </h1>

          {tableLabel && (
            <p className="text-sm text-gray-500 mb-4 font-medium">{tableLabel}</p>
          )}

          {/* Separator */}
          <div
            className="w-12 h-1 rounded-full mx-auto mb-6"
            style={{ backgroundColor: restaurant.theme_color }}
          />

          {/* Call to action */}
          <p className="text-lg font-semibold text-gray-700 mb-6">
            ¿Te ha gustado la atención?
            <br />
            <span className="text-base font-normal text-gray-500">Deja una propina digital</span>
          </p>

          {/* QR code */}
          {qrDataUrl ? (
            <div className="flex justify-center mb-4">
              <img
                src={qrDataUrl}
                alt="QR propina"
                className="w-52 h-52 rounded-2xl"
              />
            </div>
          ) : (
            <div className="w-52 h-52 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-[#2ECC87] rounded-full animate-spin" />
            </div>
          )}

          {/* URL */}
          <p className="text-xs text-gray-400 font-mono mb-6 break-all px-2">
            {tipUrl}
          </p>

          {/* Brand footer */}
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs text-gray-400">Powered by</span>
            <span
              className="text-xs font-bold"
              style={{ color: restaurant.theme_color }}
            >
              mipropina.es
            </span>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .qr-container {
            page-break-inside: avoid;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
