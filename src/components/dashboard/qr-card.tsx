"use client";

import { useState, useEffect } from "react";
import QRCodeLib from "qrcode";
import { Button } from "@/components/ui/button";

interface QRCardProps {
  slug: string;
  restaurantName: string;
}

function QRCard({ slug, restaurantName }: QRCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const url = `https://mipropina.es/t/${slug}`;

  useEffect(() => {
    QRCodeLib.toDataURL(url, {
      width: 240,
      margin: 2,
      color: { dark: "#0D1B1E", light: "#FFFFFF" },
    }).then(setQrDataUrl);
  }, [url]);

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `qr-${slug}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
      <div className="px-6 pt-6 pb-4">
        <h3 className="text-lg font-bold text-[#0D1B1E]">Tu QR</h3>
        <p className="text-xs text-gray-400 mt-0.5">Imprimelo y ponlo en las mesas</p>
      </div>

      {/* QR Code centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4">
        <div className="rounded-2xl bg-[#F5FAF7] p-4 mb-4">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR de ${restaurantName}`}
              className="w-[140px] h-[140px] rounded-xl"
            />
          ) : (
            <div className="w-[140px] h-[140px] rounded-xl bg-gray-100 animate-pulse" />
          )}
        </div>

        <p className="text-[11px] font-mono text-[#2ECC87] font-medium text-center break-all leading-tight">
          mipropina.es/t/{slug}
        </p>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <Button onClick={downloadQR} size="sm" className="flex-1 text-xs">
          <span className="flex items-center justify-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            PNG
          </span>
        </Button>
        <Button variant="secondary" onClick={copyLink} size="sm" className="flex-1 text-xs">
          {copied ? "Copiado" : "Copiar link"}
        </Button>
      </div>
    </div>
  );
}

export { QRCard };
