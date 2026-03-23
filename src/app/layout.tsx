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
  keywords: ["propinas", "digital", "restaurante", "QR", "pagos", "camareros", "hostelería", "España"],
  metadataBase: new URL("https://mipropina.es"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "mipropina.es — Propinas digitales para restaurantes",
    description: "Recibe propinas digitales por QR. Sin efectivo, sin complicaciones.",
    url: "https://mipropina.es",
    siteName: "mipropina.es",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "mipropina.es — Propinas digitales para restaurantes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "mipropina.es — Propinas digitales para restaurantes",
    description: "Recibe propinas digitales por QR. Sin efectivo, sin complicaciones.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${dmSerif.variable} ${jakarta.variable}`}>
      <head>
        <meta name="theme-color" content="#2ECC87" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(function() {});
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
