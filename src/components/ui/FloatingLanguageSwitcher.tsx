"use client";

import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export function FloatingLanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();

  if (
    pathname?.startsWith("/parents-feedback") ||
    pathname?.startsWith("/parents-interview")
  ) {
    return null;
  }

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
        fixed z-40
        bottom-20 right-4 sm:bottom-6 sm:right-6
        pb-[env(safe-area-inset-bottom)]
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
      `}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="h-4 w-4 shrink-0"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c2.5-2.2 4-5.4 4-9s-1.5-6.8-4-9m0 18c-2.5-2.2-4-5.4-4-9s1.5-6.8 4-9m-7.5 9h15"
        />
      </svg>
      {label}
    </button>
  );
}
