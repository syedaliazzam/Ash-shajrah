"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { useLanguage } from "@/contexts/LanguageContext";

export function NeedBasedScholarshipSection() {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      scrollReveal("[data-scholarship-content]", {
        trigger: sectionRef.current,
        start: "top 75%",
        stagger: 0.15,
        y: 24,
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="need-based-scholarship"
      className="relative overflow-hidden bg-white px-6 py-24 lg:px-8 lg:py-32"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(201,162,39,0.04),transparent_32%,rgba(45,138,106,0.03))]" />

      <div className="relative mx-auto max-w-4xl text-center">
        <div data-scholarship-content className={`mb-8 ${language === "ur" ? "font-urdu" : ""}`}>
          <span className="mb-4 inline-block rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
            {language === "ur" ? "ضرورت پر مبنی اسکالرشپ" : "Scholarship"}
          </span>
          <h2
            className={`mb-6 text-3xl font-bold text-emerald-deep sm:text-4xl lg:text-5xl ${
              language === "ur" ? "leading-[1.7]" : "font-display"
            }`}
          >
            {language === "ur" ? "Need Based Scholarship" : "Need Based Scholarship"}
          </h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-gold/60" />
        </div>

        <div
          data-scholarship-content
          className={`mx-auto max-w-3xl rounded-3xl border border-emerald/10 bg-cream/30 p-8 shadow-sm sm:p-12 ${
            language === "ur" ? "font-urdu" : ""
          }`}
        >
          <p
            className={`text-emerald-deep/90 ${
              language === "ur"
                ? "text-lg leading-[2.2] sm:text-xl sm:leading-[2.3]"
                : "text-lg leading-relaxed sm:text-xl sm:leading-loose"
            }`}
          >
            {language === "ur"
              ? "ہم ضرورت مند خاندانوں کے لیے need based scholarship فراہم کرتے ہیں تاکہ زیادہ بچے معیاری ابتدائی تعلیم تک رسائی حاصل کر سکیں."
              : "We are offering need-based scholarships for deserving families so more children can access quality early learning without financial pressure."}
          </p>
        </div>
      </div>
    </section>
  );
}
