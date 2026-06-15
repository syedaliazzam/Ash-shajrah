import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ash-Shajrah Learning Hub | Online Learning for Values, Creativity & Confidence",
  description:
    "A fully online learning hub for children, parents, and educators — focused on early years learning, Montessori-inspired guidance, character, creativity, confidence, and leadership.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/ash-shajrah-favicon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/ash-shajrah-favicon.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${outfit.variable}`}>
      <body className="overflow-x-hidden">{children}</body>
    </html>
  );
}
