import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "mipropina.es — Propinas digitales para restaurantes",
  description:
    "Recibe propinas digitales por QR. Sin efectivo, sin complicaciones. La forma más fácil de gestionar propinas en tu restaurante.",
  keywords: ["propinas", "digital", "restaurante", "QR", "pagos", "camareros"],
  openGraph: {
    title: "mipropina.es — Propinas digitales para restaurantes",
    description: "Recibe propinas digitales por QR. Sin efectivo, sin complicaciones.",
    url: "https://mipropina.es",
    siteName: "mipropina.es",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${dmSerif.variable} ${jakarta.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
