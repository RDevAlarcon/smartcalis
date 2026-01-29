import type { Metadata } from "next";
import { Inter } from "next/font/google";
import BrandMark from "./BrandMark";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SmartCalis",
    template: "%s · SmartCalis",
  },
  description:
    "Entrena con criterio. Progresa con control. Plataforma de calistenia con progresión real, foco técnico y longevidad.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://smartcalis.com",
  ),
  openGraph: {
    title: "SmartCalis",
    description:
      "Entrena con criterio. Progresa con control. Plataforma de calistenia con progresión real, foco técnico y longevidad.",
    url: "/",
    siteName: "SmartCalis",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/imagen1.png",
        width: 1200,
        height: 630,
        alt: "SmartCalis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartCalis",
    description:
      "Entrena con criterio. Progresa con control. Plataforma de calistenia con progresión real, foco técnico y longevidad.",
    images: ["/imagen1.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SmartCalis",
  url: "https://smartcalis.com",
  logo: "https://smartcalis.com/imagen1.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <BrandMark />
        {children}
      </body>
    </html>
  );
}