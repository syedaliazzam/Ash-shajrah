"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { useLanguage } from "@/contexts/LanguageContext";

export function ParentPartnershipSection() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      scrollReveal("[data-partnership-content]", {
        trigger: sectionRef.current,
        start: "top 75%",
        stagger: 0.15,
        y: 20,
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="parent-partnership"
      className="relative overflow-hidden bg-white px-6 py-24 lg:px-8 lg:py-32"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-emerald/[0.02] via-transparent to-emerald/[0.02]" />

      <div className="relative mx-auto max-w-4xl text-center">
        <div data-partnership-content className={`mb-8 ${language === 'ur' ? 'font-urdu' : ''}`}>
          <span className="mb-4 inline-block rounded-full border border-emerald/20 bg-emerald/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald">
            {language === 'ur' ? 'شراکت داری' : 'Partnership'}
          </span>
          <h2 className={`mb-6 text-3xl font-bold text-emerald-deep sm:text-4xl lg:text-5xl ${language === 'ur' ? 'leading-[1.7]' : 'font-display'}`}>
            {t.parentPartnership.title}
          </h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-gold/60" />
        </div>

        <div data-partnership-content className={`mx-auto max-w-3xl rounded-3xl border border-emerald/10 bg-cream/30 p-8 shadow-sm sm:p-12 ${language === 'ur' ? 'font-urdu' : ''}`}>
          <p className={`text-emerald-deep/90 ${language === 'ur' ? 'text-lg leading-[2.2] sm:text-xl sm:leading-[2.3]' : 'text-lg leading-relaxed sm:text-xl sm:leading-loose'}`}>
            {t.parentPartnership.body}
          </p>
        </div>
      </div>
    </section>
  );
}
