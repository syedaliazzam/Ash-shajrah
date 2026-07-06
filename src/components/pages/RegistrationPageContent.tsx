"use client";

import { Header } from "@/components/layout/Header";
import { RegistrationForm } from "@/components/sections/RegistrationForm";
import { SITE } from "@/lib/data";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function RegistrationPageContent() {
  return (
    <>
      <Header />
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-emerald-deep via-emerald-deep/95 to-emerald/80 pb-24 pt-32">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(201,162,39,0.12),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(45,138,106,0.18),transparent_50%)]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#faf7f0 1px, transparent 1px), linear-gradient(90deg, #faf7f0 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <BrandLogo variant="header" className="brightness-0 invert opacity-90" priority />
          </div>

          {/* Bilingual heading block */}
          <div className="mb-10 grid grid-cols-1 gap-4 text-center sm:grid-cols-2 sm:text-left">
            {/* English — left */}
            <div dir="ltr" lang="en" className="text-left">
              <h1 className="font-display text-3xl font-bold leading-tight text-cream sm:text-4xl">
                Register for {SITE.name}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-cream/75">
                Complete the form below and our admissions team will contact you soon.
              </p>
            </div>

            {/* Urdu — right */}
            <div dir="rtl" lang="ur" className="text-right">
              <h2 className="font-urdu text-3xl font-bold leading-[1.7] text-cream sm:text-4xl">
                الشجرہ لرننگ ہب میں رجسٹریشن
              </h2>
              <p className="font-urdu mt-3 text-base leading-[2.1] text-cream/75">
                نیچے دیا گیا فارم مکمل کریں، ہماری داخلہ ٹیم جلد آپ سے رابطہ کرے گی۔
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-10 h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          {/* Registration form */}
          <RegistrationForm />

          {/* WhatsApp fallback */}
          <div className="mt-8 text-center">
            <p className="text-sm text-cream/50">
              Having trouble? Contact us on{" "}
              <a
                href={SITE.contact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gold transition-colors hover:text-gold-soft"
              >
                WhatsApp
              </a>
            </p>
            <p dir="rtl" lang="ur" className="font-urdu mt-1 text-sm leading-[2] text-cream/40">
              مشکل ہو رہی ہے؟ واٹس ایپ پر رابطہ کریں
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
