"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getWhatsAppLink } from "@/lib/utils";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantName?: string;
}

function InviteModal({ open, onClose, restaurantId, restaurantName = "tu restaurante" }: InviteModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          restaurant_name: restaurantName,
          name: name.trim(),
          phone: phone.startsWith("+34") ? phone : `+34${phone.replace(/\s/g, "")}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setInviteLink(data.invite_link);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar la invitación");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWhatsAppUrl = () => {
    if (!inviteLink) return "#";
    const fullPhone = phone.startsWith("+34") ? phone : `+34${phone.replace(/\s/g, "")}`;
    const message = `¡Hola ${name}! Te invitan a unirte al equipo de ${restaurantName} en mipropina. Entra aquí para registrarte:\n\n${inviteLink}`;
    return getWhatsAppLink(fullPhone, message);
  };

  const handleClose = () => {
    setName("");
    setPhone("");
    setInviteLink(null);
    setCopied(false);
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Invitar camarero">
      {!inviteLink ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Se le enviará un enlace directo por WhatsApp para que se registre automáticamente.
          </p>
          <Input
            label="Nombre"
            placeholder="Ej: Juan Pérez"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-[#1A3C34]">
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
                className="w-full bg-white border-2 border-[#E5E7EB] rounded-r-[14px] py-3.5 px-4 text-[15px] text-[#374151] placeholder:text-[#9CA3AF] transition-colors focus:border-[#2ECC87] focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-[#EF4444]">{error}</p>
          )}

          <Button type="submit" loading={loading} className="mt-2 w-full">
            Enviar invitación
          </Button>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F5E9]">
            <svg className="h-7 w-7 text-[#2ECC87]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <div className="text-center">
            <p className="font-semibold text-[#0D1B1E]">Invitación lista para {name}</p>
            <p className="mt-1 text-sm text-gray-500">
              Envíale el enlace por WhatsApp. Al abrirlo, podrá registrarse directamente.
            </p>
          </div>

          {/* Link preview */}
          <div className="w-full rounded-2xl bg-[#F5FAF7] p-4">
            <p className="break-all text-center text-xs font-mono text-gray-500">
              {inviteLink}
            </p>
          </div>

          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleCopy}
            >
              {copied ? "✓ Copiado" : "Copiar enlace"}
            </Button>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 text-[15px] font-bold text-white bg-[#25D366] rounded-[14px] hover:bg-[#20bd5a] transition-colors"
            >
              <span>💬</span>
              WhatsApp
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
