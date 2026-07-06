"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { useLanguage } from "@/contexts/LanguageContext";

const LEAVES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${8 + (i * 5.8) % 84}%`,
  size: 11 + (i % 4) * 3,
}));

export function VisionSection() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const leavesRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !leavesRef.current) return;

      scrollReveal("[data-vision-content]", {
        trigger: sectionRef.current,
        start: "top 75%",
        stagger: 0.2,
      });

      const leaves = leavesRef.current.querySelectorAll("[data-leaf]");
      gsap.fromTo(
        leaves,
        { y: 80, opacity: 0.3 },
        {
          y: -120,
          opacity: 0.9,
          duration: 2,
          stagger: 0.08,
          ease: "power1.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            end: "bottom 20%",
            scrub: 1,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="vision"
      className="relative overflow-hidden bg-emerald-deep px-6 py-24 lg:px-8 lg:py-32"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,138,106,0.35),transparent_70%)]" />

      <div ref={leavesRef} className="pointer-events-none absolute inset-0 overflow-hidden">
        {LEAVES.map((leaf) => (
          <div
            key={leaf.id}
            data-leaf
            className="absolute bottom-[20%]"
            style={{ left: leaf.left, width: leaf.size, height: leaf.size * 1.6 }}
          >
            <svg viewBox="0 0 20 32" fill="none" className="h-full w-full">
              <ellipse
                cx="10"
                cy="16"
                rx="8"
                ry="14"
                fill={leaf.id % 3 === 0 ? "#c9a227" : "#2d8a6a"}
                opacity="0.8"
              />
            </svg>
          </div>
        ))}
        <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-gold/15" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* ── Mission ── */}
        <div data-vision-content className="mb-16 lg:mb-20">
          <div className={`text-center mb-16 ${language === 'ur' ? 'font-urdu' : ''}`}>
            <span className="mb-4 inline-block rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
              {language === 'ur' ? 'مشن' : 'Mission'}
            </span>
            <h2 className={`mb-4 text-3xl font-bold text-cream sm:text-4xl ${language === 'ur' ? 'leading-[1.8]' : 'font-display'}`}>
              {t.about.missionTitle}
            </h2>
          </div>
          <div className="relative mx-auto max-w-4xl text-center">
            <p className={`text-cream/90 sm:text-lg lg:text-xl ${language === 'ur' ? 'font-urdu leading-[2.2]' : 'leading-relaxed'}`}>
              {t.about.missionBody}
            </p>
          </div>
        </div>

        {/* Gold divider */}
        <div
          data-vision-content
          className="mx-auto mb-16 h-px max-w-sm bg-gradient-to-r from-transparent via-gold/60 to-transparent lg:mb-20"
        />

        {/* ── Vision ── */}
        <div data-vision-content>
          <div className={`text-center mb-16 ${language === 'ur' ? 'font-urdu' : ''}`}>
            <span className="mb-4 inline-block rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
              {language === 'ur' ? 'نصب العین' : 'Vision'}
            </span>
            <h2 className={`mb-4 text-3xl font-bold text-cream sm:text-4xl ${language === 'ur' ? 'leading-[1.8]' : 'font-display'}`}>
              {t.about.visionTitle}
            </h2>
          </div>
          <div className="relative mx-auto max-w-4xl text-center">
            <p className={`text-cream/90 sm:text-lg lg:text-xl ${language === 'ur' ? 'font-urdu leading-[2.2]' : 'leading-relaxed'}`}>
              {t.about.visionBody}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
