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
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-[#0D1B1E] mb-4">Tu código QR</h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* QR Code */}
        <div className="flex-shrink-0 rounded-2xl bg-[#F5FAF7] p-5">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR de ${restaurantName}`}
              className="w-[160px] h-[160px] rounded-xl"
            />
          ) : (
            <div className="w-[160px] h-[160px] rounded-xl bg-gray-100 animate-pulse" />
          )}
        </div>

        {/* Info + Actions */}
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm text-gray-500 mb-1">
            Imprime este QR y ponlo en las mesas de tu restaurante.
          </p>
          <p className="text-sm font-medium text-[#2ECC87] mb-4 font-mono break-all">
            {url}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={downloadQR} size="sm">
              Descargar PNG
            </Button>
            <Button variant="secondary" onClick={copyLink} size="sm">
              Copiar enlace
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { QRCard };
