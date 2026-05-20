"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantName?: string;
}

type Role = "waiter" | "kitchen";

const ROLE_OPTIONS: { value: Role; label: string; icon: string }[] = [
  { value: "waiter", label: "Camarero", icon: "🧑‍🍳" },
  { value: "kitchen", label: "Cocina", icon: "👨‍🍳" },
];

function InviteModal({
  open,
  onClose,
  restaurantId,
  restaurantName = "tu restaurante",
}: InviteModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("waiter");
  const [result, setResult] = useState<{
    invite_link: string;
    whatsapp_link: string;
  } | null>(null);
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
          name: name.trim(),
          phone,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult({
        invite_link: data.invite_link,
        whatsapp_link: data.whatsapp_link,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar la invitación");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.invite_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setName("");
    setPhone("");
    setRole("waiter");
    setResult(null);
    setCopied(false);
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Invitar al equipo">
      {!result ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Le aparecerá un enlace que abrirá WhatsApp con el mensaje listo. Tú
            le das al botón verde y se envía desde tu móvil.
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

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-[#1A3C34]">Rol</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-[14px] border-2 text-sm font-semibold transition-colors ${
                    role === opt.value
                      ? "border-[#2ECC87] bg-[#E8F5E9] text-[#1A3C34]"
                      : "border-[#E5E7EB] bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="text-lg">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-[#EF4444]">{error}</p>}

          <Button type="submit" loading={loading} className="mt-2 w-full">
            Generar enlace
          </Button>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F5E9]">
            <svg
              className="h-7 w-7 text-[#2ECC87]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>

          <div className="text-center">
            <p className="font-semibold text-[#0D1B1E]">
              Enlace listo para {name}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Pulsa &quot;WhatsApp&quot; para abrir el chat con el mensaje ya
              escrito desde {restaurantName}.
            </p>
          </div>

          <div className="w-full rounded-2xl bg-[#F5FAF7] p-4">
            <p className="break-all text-center text-xs font-mono text-gray-500">
              {result.invite_link}
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
              href={result.whatsapp_link}
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
