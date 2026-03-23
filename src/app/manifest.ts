import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "mipropina — Propinas digitales",
    short_name: "mipropina",
    description: "Recibe propinas digitales por QR. Sin efectivo, sin complicaciones.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F5FAF7",
    theme_color: "#2ECC87",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
