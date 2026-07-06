"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { useLanguage } from "@/contexts/LanguageContext";

export function CurriculumSection() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !tableRef.current) return;

      scrollReveal("[data-curriculum-row]", {
        trigger: sectionRef.current,
        start: "top 75%",
        stagger: 0.1,
        y: 20,
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="curriculum"
      className="relative overflow-hidden bg-gradient-to-b from-white via-cream/30 to-emerald/[0.02] px-6 py-24 lg:px-8 lg:py-32"
    >
      <div className="relative mx-auto max-w-5xl">
        <div className={`mb-12 sm:mb-16 text-center ${language === 'ur' ? 'font-urdu' : ''}`}>
          <span className={`mb-5 inline-block rounded-full border border-emerald/20 bg-emerald/10 px-5 py-2 font-semibold uppercase text-emerald ${language === 'ur' ? 'font-urdu text-sm tracking-widest' : 'text-sm tracking-[0.2em]'}`}>
            {language === 'ur' ? 'نصاب' : 'Curriculum'}
          </span>

          <div className="mx-auto max-w-3xl text-center">
            <h2 className={`${language === 'ur' ? 'leading-[1.7]' : 'font-display leading-tight'} text-3xl font-bold sm:text-4xl lg:text-[2.6rem] text-emerald-deep`}>
              {t.curriculumTable.title}
            </h2>
            <p className={`mt-4 text-emerald/70 ${language === 'ur' ? 'leading-[2] sm:text-lg sm:leading-[2.1]' : 'text-base leading-relaxed sm:text-lg'}`}>
              {t.curriculumTable.subtitle}
            </p>
          </div>
        </div>

        <div ref={tableRef} className="overflow-hidden rounded-2xl border border-emerald/15 bg-white/70 shadow-lg shadow-emerald-deep/5 backdrop-blur-md">
          <div className={`grid grid-cols-1 md:grid-cols-[1fr_2fr] border-b border-emerald/15 bg-emerald/5 px-6 py-4 sm:px-8 ${language === 'ur' ? 'text-right font-urdu' : 'text-left font-display'}`}>
            <div className="font-semibold text-emerald-deep text-lg">{t.curriculumTable.headers.area}</div>
            <div className="hidden md:block font-semibold text-emerald-deep text-lg">{t.curriculumTable.headers.description}</div>
          </div>
          
          <div className="divide-y divide-emerald/10">
            {t.curriculumTable.rows.map((row, i) => (
              <div 
                key={i} 
                data-curriculum-row
                className={`grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-2 md:gap-6 px-6 py-5 sm:px-8 transition-colors hover:bg-emerald/5 ${language === 'ur' ? 'text-right font-urdu' : 'text-left'}`}
              >
                <div className={`font-semibold text-emerald-deep ${language === 'ur' ? 'text-lg leading-[1.8]' : 'text-base'}`}>
                  {row.area}
                </div>
                <div className={`text-emerald-deep/80 ${language === 'ur' ? 'text-base leading-[2.1]' : 'text-sm sm:text-base leading-relaxed'}`}>
                  {row.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
