import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://ashshajrah.com"
  ),
  title: {
    default: "Ash-Shajrah Learning Hub | Online Early Years Learning",
    template: "%s | Ash-Shajrah Learning Hub",
  },
  description:
    "Ash-Shajrah Learning Hub is an online early childhood learning hub for Play Group, Prep-I and Prep-II, focused on language, numeracy, Fehm-e-Deen, Islamic values, creativity, character, confidence, and parent-supported home learning.",
  keywords: [
    "Ash-Shajrah Learning Hub",
    "Ash Shajrah",
    "online learning hub Pakistan",
    "online preschool Pakistan",
    "online pre-primary school Pakistan",
    "online early years learning",
    "online Play Group Pakistan",
    "online Prep-I Pakistan",
    "online Prep-II Pakistan",
    "Islamic online learning for children",
    "Fehm-e-Deen for kids",
    "online Islamic preschool",
    "parent partnership learning",
    "early childhood education Pakistan",
    "online ECE Pakistan",
    "character building for children",
    "online classes for Pakistani kids",
    "overseas Pakistani online school",
    "Urdu English online learning",
    "online learning for Pakistani children",
    "values based education Pakistan",
  ],
  openGraph: {
    type: "website",
    title: "Ash-Shajrah Learning Hub | Online Early Years Learning",
    description:
      "Online early childhood learning with parent partnership, Islamic values, creativity, confidence, and character development.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://ashshajrah.com",
    siteName: "Ash-Shajrah Learning Hub",
    locale: "en_US",
    alternateLocale: "ur_PK",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ash-Shajrah Learning Hub online early years learning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ash-Shajrah Learning Hub",
    description:
      "Online early years learning rooted in values, character, and leadership.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/ash-shajrah-favicon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/ash-shajrah-favicon.png", type: "image/png" }],
  },
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      "ur-PK": "/?lang=ur",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
