"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { useLanguage } from "@/contexts/LanguageContext";
import { LogoPhilosophyModal } from "@/components/ui/LogoPhilosophyModal";

export function LogoPhilosophySection() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      scrollReveal("[data-logo-content]", {
        trigger: sectionRef.current,
        start: "top 75%",
        stagger: 0.15,
        y: 30,
      });
    },
    { scope: sectionRef }
  );

  return (
    <>
      <section
        ref={sectionRef}
        id="logo-philosophy"
        className="relative overflow-hidden bg-white px-6 py-24 lg:px-8 lg:py-32"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(45,138,106,0.03),transparent_70%)]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div data-logo-content className={`mb-12 ${language === 'ur' ? 'font-urdu' : ''}`}>
            <span className="mb-4 inline-block rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
              {language === 'ur' ? 'لوگو کی فلاسفی' : 'Our Symbol'}
            </span>
            <h2 className={`mb-6 text-3xl font-bold text-emerald-deep sm:text-4xl lg:text-5xl ${language === 'ur' ? 'leading-[1.7]' : 'font-display'}`}>
              {t.logoPhilosophy.title}
            </h2>
            <p className={`mx-auto max-w-2xl text-emerald-deep/80 ${language === 'ur' ? 'text-lg leading-[2.2]' : 'text-lg leading-relaxed'}`}>
              {t.logoPhilosophy.shortText}
            </p>
          </div>

          <div data-logo-content>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-emerald px-8 py-4 text-sm font-semibold text-cream shadow-md shadow-emerald/20 transition-all hover:bg-emerald-light hover:shadow-emerald/30"
            >
              <svg className="h-5 w-5 text-gold-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>{t.logoPhilosophy.buttonText}</span>
            </button>
          </div>
        </div>
      </section>

      <LogoPhilosophyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
