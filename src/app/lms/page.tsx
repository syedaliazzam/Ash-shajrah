"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LmsDashboardPage() {
  const { language, t } = useLanguage();
  const isUrdu = language === "ur";
  const card = t.lms.dashboard.careersCard;

  return (
    <div dir={isUrdu ? "rtl" : "ltr"} lang={isUrdu ? "ur" : "en"}>
      <h1
        className={`text-2xl font-bold text-emerald-deep sm:text-3xl ${
          isUrdu ? "font-urdu leading-[1.7]" : "font-display"
        }`}
      >
        {t.lms.dashboard.title}
      </h1>
      <p
        className={`mt-2 max-w-2xl text-emerald-deep/70 ${
          isUrdu ? "font-urdu leading-[2]" : ""
        }`}
      >
        {t.lms.dashboard.subtitle}
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-emerald/10 bg-white p-6 shadow-sm">
          <h2
            className={`text-lg font-bold text-emerald-deep ${
              isUrdu ? "font-urdu leading-[1.8]" : "font-display"
            }`}
          >
            {card.title}
          </h2>
          <p
            className={`mt-2 text-sm text-emerald-deep/70 ${
              isUrdu ? "font-urdu leading-[2]" : "leading-relaxed"
            }`}
          >
            {card.description}
          </p>
          <Link
            href="/lms/careers"
            className={`mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-emerald-light ${
              isUrdu ? "font-urdu" : ""
            }`}
          >
            {card.button}
          </Link>
        </div>
      </div>
    </div>
  );
}
