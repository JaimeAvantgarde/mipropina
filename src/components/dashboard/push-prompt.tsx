"use client";

import { useState, useEffect } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushPrompt() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
    if (localStorage.getItem("push-prompt-dismissed")) {
      setDismissed(true);
    }
  }, []);

  async function subscribe() {
    try {
      const swReg = await navigator.serviceWorker.ready;
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") return;

      const subscription = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!) as BufferSource,
      });

      const keys = subscription.toJSON().keys!;
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        }),
      });
    } catch (err) {
      console.error("Error subscribing to push:", err);
    }
  }

  function dismiss() {
    setDismissed(true);
    localStorage.setItem("push-prompt-dismissed", "1");
  }

  // Don't show if already subscribed, denied, unsupported, or dismissed
  if (permission === "granted" || permission === "denied" || permission === "unsupported" || dismissed) {
    return null;
  }

  if (!VAPID_PUBLIC_KEY) return null;

  return (
    <div className="mb-6 rounded-2xl bg-white border border-[#2ECC87]/20 shadow-sm px-5 py-4 flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#2ECC87]/10 flex items-center justify-center">
        <svg className="w-5 h-5 text-[#2ECC87]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0D1B1E]">Activa las notificaciones</p>
        <p className="text-xs text-[#1A3C34]/60 mt-0.5">
          Recibe un aviso cada vez que entre una propina.
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={subscribe}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#2ECC87] text-[#0D1B1E] hover:shadow-md transition-all active:scale-[0.97] cursor-pointer"
          >
            Activar
          </button>
          <button
            onClick={dismiss}
            className="px-4 py-2 text-xs font-medium rounded-xl text-[#1A3C34]/50 hover:bg-gray-100 transition-all cursor-pointer"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
