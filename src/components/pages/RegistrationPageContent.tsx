"use client";

import { Header } from "@/components/layout/Header";
import { RegistrationForm } from "@/components/sections/RegistrationForm";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_URL } from "@/lib/constants";

export function RegistrationPageContent() {
  const { language, t } = useLanguage();

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

          {/* Heading block */}
          <div
            dir={language === "ur" ? "rtl" : "ltr"}
            lang={language === "ur" ? "ur" : "en"}
            className="mb-10 mx-auto max-w-3xl text-center"
          >
            <h1
              className={`${
                language === "ur"
                  ? "font-urdu text-3xl font-bold leading-[1.7] text-cream sm:text-4xl"
                  : "font-display text-3xl font-bold leading-tight text-cream sm:text-4xl"
              }`}
            >
              {t.register.title}
            </h1>
            <p
              className={`${
                language === "ur"
                  ? "font-urdu mt-3 text-base leading-[2.1] text-cream/75"
                  : "mt-3 text-base leading-relaxed text-cream/75"
              }`}
            >
              {t.register.subtitle}
            </p>
          </div>

          {/* Divider */}
          <div className="mb-10 h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          {/* Registration form */}
          <RegistrationForm />

          {/* WhatsApp fallback */}
          <div className="mt-8 text-center">
            <p
              dir={language === "ur" ? "rtl" : "ltr"}
              lang={language === "ur" ? "ur" : "en"}
              className={`${
                language === "ur"
                  ? "font-urdu text-sm leading-[2] text-cream/50"
                  : "text-sm text-cream/50"
              }`}
            >
              {language === "ur" ? "مشکل ہو رہی ہے؟ " : "Having trouble? "}
              {language === "ur" ? "پر رابطہ کریں" : "Contact us on "}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gold transition-colors hover:text-gold-soft"
              >
                {language === "ur" ? "واٹس ایپ" : "WhatsApp"}
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
