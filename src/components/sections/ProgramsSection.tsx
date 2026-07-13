"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { useLanguage } from "@/contexts/LanguageContext";
import { REGISTER_URL } from "@/lib/constants";

export function ProgramsSection() {
  const { t, language } = useLanguage();

  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !gridRef.current) return;

      const cards = gridRef.current.querySelectorAll("[data-program-card]");
      scrollReveal(cards, {
        trigger: gridRef.current,
        start: "top 72%",
        stagger: 0.08,
        y: 40,
      });

      scrollReveal("[data-programs-cta]", {
        trigger: gridRef.current,
        start: "bottom 90%",
        y: 20,
      });
    },
    { scope: sectionRef }
  );

  const handleEnter = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      y: -6,
      scale: 1.015,
      duration: 0.35,
      ease: "power2.out",
    });
  };

  const handleLeave = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      duration: 0.35,
      ease: "power2.out",
    });
  };

  const programsList = [
    t.programs.playgroup,
    t.programs.prepI,
    t.programs.prepII,
    t.programs.parentPartnership,
  ];

  return (
    <section
      ref={sectionRef}
      id="programs"
      className="relative overflow-hidden bg-gradient-to-b from-cream via-white to-cream px-6 py-24 lg:px-8 lg:py-32"
    >
      {/* Background soft light shapes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(201,162,39,0.04),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(26,92,69,0.03),transparent_60%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className={`text-center ${language === 'ur' ? 'font-urdu' : ''}`}>
          <span className="mb-4 inline-block rounded-full border border-emerald/20 bg-emerald/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald">
            {t.nav.programs}
          </span>
          <h2 className={`mb-4 text-3xl font-bold text-emerald-deep sm:text-4xl ${language === 'ur' ? 'leading-[1.8]' : 'font-display'}`}>
            {t.programs.title}
          </h2>
          <p className={`mx-auto max-w-2xl text-emerald-deep/80 sm:text-lg ${language === 'ur' ? 'leading-[2]' : 'leading-relaxed'}`}>
            {t.programs.subtitle}
          </p>
        </div>

        {/* 2x2 grid on desktop, 2 columns on tablet, 1 column on mobile */}
        <div
          ref={gridRef}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8"
        >
          {programsList.map((program, index) => (
            <article
              key={index}
              data-program-card
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
              className={`group relative overflow-hidden rounded-3xl border border-emerald/10 bg-white/70 p-6 shadow-md transition-all duration-300 hover:border-gold/30 hover:bg-white hover:shadow-xl hover:shadow-emerald/5 md:p-8 ${language === 'ur' ? 'text-right' : 'text-left'}`}
            >
              {/* Gold/Green accent indicator */}
              <div className={`absolute top-0 h-full w-1.5 bg-gradient-to-b from-gold to-emerald opacity-80 group-hover:opacity-100 ${language === 'ur' ? 'right-0' : 'left-0'}`} />

              <div className="mb-4 border-b border-emerald/5 pb-3">
                <h3 className={`${language === 'ur' ? 'font-urdu' : 'font-display'} text-xl font-bold text-emerald-deep sm:text-2xl`}>
                  {program.title}
                </h3>
              </div>

              <div>
                <p className={`${language === 'ur' ? 'font-urdu leading-[2]' : 'leading-relaxed'} text-sm text-emerald-deep/80`}>
                  {program.body}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Enroll Button below the cards */}
        <div data-programs-cta className="relative z-30 mt-16 flex justify-center pointer-events-auto">
          <a
            href={REGISTER_URL}
            className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center ${language === 'ur' ? 'font-urdu' : ''} rounded-full bg-emerald px-8 py-3.5 text-sm font-semibold tracking-wide text-cream shadow-lg shadow-emerald/20 transition-all duration-300 hover:bg-emerald-light hover:shadow-emerald/35 hover:scale-105 active:scale-95`}
          >
            {t.nav.enroll}
          </a>
        </div>
      </div>
    </section>
  );
}
