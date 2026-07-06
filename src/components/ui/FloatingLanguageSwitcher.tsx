"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export function FloatingLanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const nextLanguage = language === "en" ? "ur" : "en";
  const label = language === "en" ? "اردو" : "EN";

  return (
    <button
      type="button"
      onClick={() => setLanguage(nextLanguage)}
      aria-label={
        language === "en"
          ? "Switch language to Urdu"
          : "Switch language to English"
      }
      dir="ltr"
      className={`
        fixed bottom-[90px] right-5 z-[9999]
        inline-flex min-h-12 min-w-[88px] items-center justify-center gap-2
        rounded-full border border-white/25
        bg-emerald-deep px-4 py-3
        text-sm font-semibold text-cream
        shadow-2xl shadow-emerald-deep/30
        transition-all duration-300
        hover:-translate-y-1 hover:bg-emerald
        hover:shadow-emerald-deep/40
        focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-deep
        active:scale-95
        md:bottom-[90px] md:right-6
      `}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-4 w-4 shrink-0 text-gold-soft"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.998 8.998 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
        />
      </svg>
      <span 
        dir={language === "en" ? "rtl" : "ltr"}
        lang={language === "en" ? "ur" : "en"}
        className={`inline-flex items-center justify-center whitespace-nowrap text-center leading-none ${language === "en" ? "font-urdu text-base translate-y-[1px]" : "font-display"}`}
      >
        {label}
      </span>
    </button>
  );
}
