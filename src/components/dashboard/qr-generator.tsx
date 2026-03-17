"use client";

import { useState, useCallback } from "react";
import QRCodeLib from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { QRCode } from "@/lib/types";

const RESTAURANT_SLUG = "la-tasca-de-maria";
const BASE_URL = "https://mipropina.es/t";

const mockQRCodes: QRCode[] = [
  {
    id: "qr1",
    restaurant_id: "demo",
    table_label: "Mesa 1",
    url: `${BASE_URL}/${RESTAURANT_SLUG}?mesa=1`,
    created_at: "2024-12-01T10:00:00Z",
  },
  {
    id: "qr2",
    restaurant_id: "demo",
    table_label: "Mesa 2",
    url: `${BASE_URL}/${RESTAURANT_SLUG}?mesa=2`,
    created_at: "2024-12-01T10:05:00Z",
  },
  {
    id: "qr3",
    restaurant_id: "demo",
    table_label: "Barra",
    url: `${BASE_URL}/${RESTAURANT_SLUG}?mesa=barra`,
    created_at: "2024-12-15T14:30:00Z",
  },
];

function QRGenerator() {
  const [tableLabel, setTableLabel] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [codes, setCodes] = useState<QRCode[]>(mockQRCodes);

  const generateQR = useCallback(async () => {
    if (!tableLabel.trim()) return;
    setGenerating(true);

    const slug = tableLabel.toLowerCase().replace(/\s+/g, "-");
    const url = `${BASE_URL}/${RESTAURANT_SLUG}?mesa=${slug}`;

    try {
      const dataUrl = await QRCodeLib.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: "#0D1B1E",
          light: "#FFFFFF",
        },
      });
      setQrDataUrl(dataUrl);
      setQrUrl(url);

      const newCode: QRCode = {
        id: `qr-${Date.now()}`,
        restaurant_id: "demo",
        table_label: tableLabel,
        url,
        created_at: new Date().toISOString(),
      };
      setCodes((prev) => [newCode, ...prev]);
    } catch {
      // QR generation failed silently
    } finally {
      setGenerating(false);
    }
  }, [tableLabel]);

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `qr-${tableLabel.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Generator */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#0D1B1E] mb-4">
          Generar nuevo QR
        </h3>

        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Ej: Mesa 1, Barra, Terraza..."
              value={tableLabel}
              onChange={(e) => {
                setTableLabel(e.target.value);
                setQrDataUrl(null);
              }}
            />
          </div>
          <Button onClick={generateQR} loading={generating} disabled={!tableLabel.trim()}>
            Generar QR
          </Button>
        </div>

        {/* QR Preview */}
        {qrDataUrl && (
          <div className="flex flex-col items-center gap-4 bg-[#F5FAF7] rounded-2xl p-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              {tableLabel}
            </p>
            <img
              src={qrDataUrl}
              alt={`QR code for ${tableLabel}`}
              className="w-[200px] h-[200px] rounded-xl shadow-sm"
            />
            <p className="text-xs text-gray-400 font-mono break-all text-center max-w-xs">
              {qrUrl}
            </p>
            <Button variant="secondary" onClick={downloadQR}>
              Descargar PNG
            </Button>
          </div>
        )}
      </div>

      {/* Existing codes */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-[#0D1B1E]">
            Códigos QR generados
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {codes.map((code) => (
            <div
              key={code.id}
              className="px-6 py-4 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-[#0D1B1E] text-sm">
                  {code.table_label}
                </p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  {code.url}
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(code.created_at).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { QRGenerator };
