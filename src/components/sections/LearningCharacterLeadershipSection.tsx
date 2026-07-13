"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { useLanguage } from "@/contexts/LanguageContext";

export function LearningCharacterLeadershipSection() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      scrollReveal("[data-lcl-card]", {
        trigger: sectionRef.current,
        start: "top 75%",
        stagger: 0.15,
        y: 30,
      });
      
      scrollReveal("[data-lcl-header]", {
        trigger: sectionRef.current,
        start: "top 80%",
        y: 20,
      });
    },
    { scope: sectionRef }
  );

  const cards = [
    { id: 'learning', title: t.lclExplanation.cards.learning },
    { id: 'character', title: t.lclExplanation.cards.character },
    { id: 'leadership', title: t.lclExplanation.cards.leadership },
  ];

  return (
    <section
      ref={sectionRef}
      id="lcl-explanation"
      className="relative overflow-hidden bg-cream px-6 py-24 lg:px-8 lg:py-32"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.03] to-transparent" />
      
      <div className="relative mx-auto max-w-7xl">
        <div data-lcl-header className={`mb-16 text-center ${language === 'ur' ? 'font-urdu' : ''}`}>
          <h2 className={`${language === 'ur' ? 'leading-[1.7]' : 'font-display leading-tight'} mb-6 text-3xl font-bold text-emerald-deep sm:text-4xl lg:text-5xl`}>
            {t.lclExplanation.title}
          </h2>
          <p className={`mx-auto max-w-3xl text-emerald/80 ${language === 'ur' ? 'text-lg leading-[2.1]' : 'text-lg leading-relaxed'}`}>
            {t.lclExplanation.shortCopy}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card, idx) => (
            <div 
              key={card.id}
              data-lcl-card
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm shadow-emerald/5 border border-emerald/10 transition-all hover:shadow-lg hover:shadow-emerald/10 hover:border-gold/30"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald/5 blur-2xl transition-all group-hover:bg-gold/10" />
              
              <div className="flex flex-col h-full justify-center text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald/10 text-emerald-deep self-center group-hover:bg-gold/20 group-hover:text-gold transition-colors">
                  <span className="font-display text-xl font-bold">{idx + 1}</span>
                </div>
                <h3 className={`text-2xl font-bold text-emerald-deep ${language === 'ur' ? 'font-urdu' : 'font-display'}`}>
                  {card.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
