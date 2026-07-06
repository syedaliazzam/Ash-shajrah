"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { FloatingIcons } from "@/components/ui/FloatingIcons";
import { useLanguage } from "@/contexts/LanguageContext";
import { IntroductionModal } from "@/components/ui/IntroductionModal";

export function AboutSection() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      scrollReveal("[data-about-content]", {
        trigger: sectionRef.current,
        start: "top 75%",
        stagger: 0.15,
      });
    },
    { scope: sectionRef }
  );

  return (
    <>
      <section
        ref={sectionRef}
        id="about"
        className="relative overflow-hidden px-6 py-24 lg:px-8 lg:py-32"
      >
        <FloatingIcons />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald/[0.03] to-transparent" />

        <div className="relative mx-auto max-w-7xl">
          <div data-about-content className={`text-center ${language === 'ur' ? 'font-urdu' : ''}`}>
            <span className="mb-4 inline-block rounded-full border border-emerald/20 bg-emerald/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald">
              {language === 'ur' ? 'تعارف' : 'Who We Are'}
            </span>
            <h2 className={`mb-4 text-3xl font-bold text-emerald-deep sm:text-4xl ${language === 'ur' ? 'leading-[1.8]' : 'font-display'}`}>
              {t.about.introductionTitle}
            </h2>
          </div>

          <div data-about-content className={`mx-auto mt-8 max-w-3xl text-center flex flex-col items-center gap-6 ${language === 'ur' ? 'font-urdu' : ''}`}>
            <p className={`text-emerald-deep/80 sm:text-lg ${language === 'ur' ? 'leading-[2.2]' : 'leading-relaxed'}`}>
              {t.about.introductionBody}
            </p>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-emerald/20 bg-white px-6 py-2.5 text-sm font-semibold text-emerald transition-all hover:bg-emerald/5 hover:border-emerald/40 shadow-sm"
            >
              <span>{t.about.readMore}</span>
              <svg className={`h-4 w-4 ${language === 'ur' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Key pillars row */}
          <div data-about-content className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { key: "playgroup", en: "Play Group", ur: "پلے گروپ" },
              { key: "prepI", en: "Prep-I", ur: "پری پہلی" },
              { key: "prepII", en: "Prep-II", ur: "پری دوئم" },
              { key: "parentPartnership", en: "Parent Partnership", ur: "والدین کی شراکت" },
            ].map((item) => (
              <div
                key={item.key}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-emerald/10 bg-white/60 p-4 text-center shadow-sm backdrop-blur-sm min-h-[5rem]"
              >
                <span className={`text-emerald-deep font-semibold ${language === 'ur' ? 'font-urdu text-sm leading-[1.9]' : 'text-sm'}`}>
                  {language === 'ur' ? item.ur : item.en}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <IntroductionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
