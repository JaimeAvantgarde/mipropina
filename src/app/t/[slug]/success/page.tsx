"use client";

import { useEffect, useState, use } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";

type Restaurant = {
  name: string;
  theme_color: string;
  thank_you_message: string | null;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

const DEFAULT_MESSAGE = "Tu propina ha sido recibida correctamente. ¡El equipo te lo agradece mucho!";

export default function SuccessPage({ params }: PageProps) {
  const { slug } = use(params);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    // Fetch restaurant for branding and custom message
    fetch(`/api/restaurant/${slug}`)
      .then((r) => r.json())
      .then(setRestaurant)
      .catch(() => {});

    // Fire confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#2ECC87", "#A8F0D2", "#0D1B1E"],
    });

    const timer = setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#2ECC87", "#A8F0D2", "#F5FAF7"],
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [slug]);

  const brandColor = restaurant?.theme_color || "#2ECC87";
  const message = restaurant?.thank_you_message || DEFAULT_MESSAGE;

  return (
    <main
      className="min-h-screen bg-gradient-to-b from-[#F5FAF7] via-[#E8F5E9] to-[#F5FAF7] flex items-center justify-center px-4"
      style={{ "--brand-color": brandColor } as React.CSSProperties}
    >
      <div className="w-full max-w-sm text-center">
        {/* Animated checkmark */}
        <div className="flex justify-center mb-8">
          <div
            className="relative w-24 h-24 rounded-full flex items-center justify-center animate-[scaleIn_0.5s_ease-out_forwards]"
            style={{
              backgroundColor: brandColor,
              boxShadow: `0 8px 32px ${brandColor}59`,
            }}
          >
            <svg
              className="w-12 h-12 text-white animate-[drawCheck_0.4s_ease-out_0.3s_forwards]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M5 13l4 4L19 7"
                strokeDasharray="24"
                strokeDashoffset="0"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-serif text-3xl text-[#0D1B1E] mb-3 leading-tight">
          ¡Gracias por tu propina!
        </h1>

        <p className="text-[#1A3C34]/70 text-base mb-10 leading-relaxed">
          {message}
        </p>

        {/* Back link */}
        <Link
          href={`/t/${slug}`}
          className="inline-block w-full py-4 rounded-2xl text-white font-semibold text-base transition-all duration-200 active:scale-[0.98]"
          style={{ backgroundColor: "#0D1B1E" }}
        >
          Volver al restaurante
        </Link>

        {/* Footer */}
        <p className="text-[10px] text-[#1A3C34]/30 mt-8 font-medium tracking-wide">
          mipropina.es
        </p>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          60% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes drawCheck {
          0% {
            stroke-dashoffset: 24;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </main>
  );
}
