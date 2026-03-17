"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateInviteCode, getWhatsAppLink } from "@/lib/utils";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  restaurantId: string;
}

function InviteModal({ open, onClose, restaurantId }: InviteModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    const code = generateInviteCode("MP");
    setGeneratedCode(code);
  };

  const handleCopy = async () => {
    if (!generatedCode) return;
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWhatsAppUrl = () => {
    if (!generatedCode) return "#";
    const fullPhone = phone.startsWith("+34") ? phone : `+34${phone}`;
    const message = `¡Hola ${name}! Te han invitado a mipropina.es. Usa este código para registrarte: ${generatedCode}. Entra en: https://mipropina.es/auth/registro`;
    return getWhatsAppLink(fullPhone, message);
  };

  const handleClose = () => {
    setName("");
    setPhone("");
    setGeneratedCode(null);
    setCopied(false);
    onClose();
  };

  // Suppress unused var warning
  void restaurantId;

  return (
    <Modal open={open} onClose={handleClose} title="Invitar camarero">
      {!generatedCode ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nombre"
            placeholder="Ej: Juan Pérez"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-dark-mid">
              Teléfono
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-4 bg-gray-100 border-2 border-r-0 border-[#E5E7EB] rounded-l-[14px] text-sm text-gray-500 font-medium">
                +34
              </span>
              <input
                type="tel"
                placeholder="612 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-white border-2 border-[#E5E7EB] rounded-r-[14px] py-3.5 px-4 text-[15px] text-[#374151] placeholder:text-[#9CA3AF] transition-colors duration-200 ease-out focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <Button type="submit" className="mt-2 w-full">
            Generar invitación
          </Button>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <p className="text-sm text-gray-500 text-center">
            Código de invitación para <strong>{name}</strong>
          </p>
          <div className="bg-[#F5FAF7] rounded-2xl px-8 py-5 text-center">
            <p className="text-3xl font-bold tracking-[0.15em] text-[#0D1B1E] font-[family-name:var(--font-serif)]">
              {generatedCode}
            </p>
          </div>

          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleCopy}
            >
              {copied ? "✓ Copiado" : "Copiar código"}
            </Button>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 text-[15px] font-bold text-white bg-[#25D366] rounded-[14px] hover:bg-[#20bd5a] transition-colors"
            >
              <span>💬</span>
              Enviar por WhatsApp
            </a>
          </div>

          <button
            onClick={handleClose}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}
    </Modal>
  );
}

export { InviteModal };
