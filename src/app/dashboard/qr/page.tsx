"use client";

import { QRGenerator } from "@/components/dashboard/qr-generator";

export default function QRPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-[family-name:var(--font-serif)] text-[#0D1B1E]">
          Códigos QR
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Genera códigos QR para cada mesa y descárgalos para imprimir
        </p>
      </div>

      {/* QR Generator */}
      <QRGenerator />
    </div>
  );
}
