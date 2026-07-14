"use client";

import { Header } from "@/components/layout/Header";
import { CareersSubmissionForm } from "@/components/careers/CareersSubmissionForm";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_URL } from "@/lib/constants";

export function CareersPageContent() {
  const { language, t } = useLanguage();
  const isUrdu = language === "ur";

  return (
    <>
      <Header />
      <main className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-b from-emerald-deep via-emerald-deep/95 to-emerald/80 pb-28 pt-28 sm:pb-24 sm:pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(201,162,39,0.12),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(45,138,106,0.18),transparent_50%)]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-center">
            <BrandLogo variant="header" className="brightness-0 invert opacity-90" priority />
          </div>

          <div
            dir={isUrdu ? "rtl" : "ltr"}
            lang={isUrdu ? "ur" : "en"}
            className="mb-10 text-center"
          >
            <p className={`text-sm font-semibold uppercase tracking-[0.2em] text-gold-soft ${isUrdu ? "font-urdu tracking-normal" : ""}`}>
              {t.careers.eyebrow}
            </p>
            <h1
              className={`mt-3 text-3xl font-bold text-cream sm:text-4xl ${
                isUrdu ? "font-urdu leading-[1.7]" : "font-display leading-tight"
              }`}
            >
              {t.careers.title}
            </h1>
            <p
              className={`mx-auto mt-4 max-w-2xl text-base text-cream/75 sm:text-lg ${
                isUrdu ? "font-urdu leading-[2.1]" : "leading-relaxed"
              }`}
            >
              {t.careers.description}
            </p>
          </div>

          <div className="mb-10 h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          <CareersSubmissionForm source="Website Careers Page" variant="website" />

          <div className="mt-8 text-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm text-cream/55 underline-offset-2 hover:text-gold-soft hover:underline ${isUrdu ? "font-urdu" : ""}`}
            >
              {t.careers.whatsappHelp}
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
