"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { CoreValuesCarousel } from "@/components/values/CoreValuesCarousel";
import { ValuesBackdrop } from "@/components/values/ValuesBackdrop";
import { useLanguage } from "@/contexts/LanguageContext";

export function ValuesSection() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!carouselRef.current) return;

      gsap.from(carouselRef.current, {
        y: 60,
        opacity: 0,
        duration: 1.15,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: carouselRef.current,
          start: "top 86%",
          once: true,
        },
      });

      const cards = carouselRef.current.querySelectorAll(".values-card");
      if (cards.length) {
        gsap.from(cards, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          stagger: 0.06,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: carouselRef.current,
            start: "top 84%",
            once: true,
          },
        });
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="values"
      className="relative overflow-hidden bg-gradient-to-b from-emerald-deep/[0.07] via-cream to-cream px-5 py-28 sm:px-6 sm:py-32 lg:px-8 lg:py-40"
    >
      <ValuesBackdrop />

      <div className="relative mx-auto max-w-[1400px]">
        <div className={`text-center mb-16 sm:mb-20 lg:mb-24 ${language === 'ur' ? 'font-urdu' : ''}`}>
          <span className="mb-4 inline-block rounded-full border border-emerald/20 bg-emerald/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald">
            {t.nav.values}
          </span>
          <h2 className={`mb-4 text-3xl font-bold text-emerald-deep sm:text-4xl ${language === 'ur' ? 'leading-[1.8]' : 'font-display'}`}>
            {t.values.title}
          </h2>
          <p className={`mx-auto max-w-3xl text-emerald-deep/80 sm:text-lg ${language === 'ur' ? 'leading-[2.2]' : 'leading-relaxed'}`}>
            {t.values.description}
          </p>
        </div>

        <div ref={carouselRef}>
          <CoreValuesCarousel />
        </div>
      </div>
    </section>
  );
}
