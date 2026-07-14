"use client";

import { CareersSubmissionForm } from "@/components/careers/CareersSubmissionForm";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LmsCareersPage() {
  const { language, t } = useLanguage();
  const isUrdu = language === "ur";

  return (
    <div dir={isUrdu ? "rtl" : "ltr"} lang={isUrdu ? "ur" : "en"} className="mx-auto max-w-3xl">
      <h1
        className={`text-2xl font-bold text-emerald-deep sm:text-3xl ${
          isUrdu ? "font-urdu leading-[1.7]" : "font-display"
        }`}
      >
        {t.careers.title}
      </h1>
      <p
        className={`mt-3 text-emerald-deep/75 ${
          isUrdu ? "font-urdu leading-[2.1]" : "leading-relaxed"
        }`}
      >
        {t.careers.description}
      </p>
      <div className="mt-8">
        <CareersSubmissionForm source="LMS Careers Page" variant="lms" />
      </div>
    </div>
  );
}
