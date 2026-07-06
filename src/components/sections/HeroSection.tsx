"use client";

import { useRef, useCallback } from "react";
import { gsap, useGSAP, ensurePlugins } from "@/lib/gsap";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { HeroVideoBackground } from "@/components/hero/HeroVideoBackground";
import { HeroParticles } from "@/components/hero/HeroParticles";
import { HeroWatermark } from "@/components/hero/HeroWatermark";
import { REGISTER_URL, WHATSAPP_URL } from "@/lib/constants";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useGSAP(
    () => {
      ensurePlugins();
      if (!sectionRef.current) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from("[data-hero-badge]", { y: 20, opacity: 0, duration: 0.8 })
        .from("[data-hero-content]", { y: 40, opacity: 0, duration: 1.0 }, "-=0.35")
        .from("[data-hero-cta]", { y: 18, opacity: 0, duration: 0.65, stagger: 0.1 }, "-=0.35");
    },
    { scope: sectionRef }
  );

  const { t, language } = useLanguage();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current || !contentRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: -((e.clientY - rect.top) / rect.height - 0.5) * 2,
    };

    gsap.to(contentRef.current, {
      x: mouseRef.current.x * 10,
      y: mouseRef.current.y * 6,
      duration: 1.1,
      ease: "power2.out",
      overwrite: "auto",
    });
    if (watermarkRef.current) {
      gsap.to(watermarkRef.current, {
        x: mouseRef.current.x * 28,
        y: mouseRef.current.y * 18,
        duration: 1.2,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: 0, y: 0 };
    if (contentRef.current) {
      gsap.to(contentRef.current, { x: 0, y: 0, duration: 1.2, ease: "power2.out" });
    }
    if (watermarkRef.current) {
      gsap.to(watermarkRef.current, { x: 0, y: 0, duration: 1.2, ease: "power2.out" });
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <HeroVideoBackground />

      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-emerald-deep/95 via-emerald-deep/80 to-emerald-deep/45" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-emerald-deep/60 via-transparent to-cream/5" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_15%_40%,rgba(201,162,39,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_75%_60%,rgba(45,138,106,0.15),transparent_50%)]" />

      <HeroParticles />
      <HeroWatermark watermarkRef={watermarkRef} />

      <div className="relative z-20 mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32 lg:px-10">
        <div ref={contentRef} className="relative z-30 w-full pointer-events-auto">


          <div data-hero-content className={`flex flex-col ${language === 'ur' ? 'text-right font-urdu items-end' : 'text-left items-start'}`}>
            <div className="max-w-3xl">
              <h1 className={`${language === 'ur' ? 'font-urdu leading-[1.6]' : 'font-display leading-tight'} text-4xl font-bold text-cream sm:text-5xl lg:text-6xl xl:text-[4rem]`}>
                {t.hero.title}
              </h1>
              <p className={`mt-4 ${language === 'ur' ? 'font-urdu leading-[2]' : 'font-display leading-snug'} text-xl font-semibold text-gold sm:text-2xl`}>
                {t.hero.subtitle}
              </p>
              <p className={`mt-4 ${language === 'ur' ? 'font-urdu leading-[2.1] sm:leading-[2.2]' : 'leading-relaxed'} text-base text-cream/80 sm:text-lg`}>
                {t.hero.description}
              </p>
            </div>

            <div className={`mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3 ${language === 'ur' ? 'items-end sm:items-center sm:justify-end' : 'items-start'}`}>
              {language === 'en' ? (
                <>
                  <div data-hero-cta className="relative z-30 pointer-events-auto">
                    <Button href={REGISTER_URL} variant="primary">
                      {t.hero.primaryCta}
                    </Button>
                  </div>
                  <div data-hero-cta className="relative z-30 pointer-events-auto">
                    <Button href="#programs" variant="secondary">
                      {t.hero.secondaryCta}
                    </Button>
                  </div>
                  <div data-hero-cta className="relative z-30 pointer-events-auto">
                    <Button href={WHATSAPP_URL} variant="light" target="_blank" rel="noopener noreferrer">
                      {t.hero.contactCta}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div data-hero-cta className="relative z-30 pointer-events-auto">
                    <a
                      href={REGISTER_URL}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-semibold text-emerald-deep shadow-lg shadow-gold/30 transition-all hover:bg-gold-soft hover:shadow-gold/45"
                    >
                      {t.hero.primaryCta}
                    </a>
                  </div>
                  <div data-hero-cta className="relative z-30 pointer-events-auto">
                    <a
                      href="#programs"
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-cream/30 bg-white/10 px-6 py-3 text-sm font-semibold text-cream backdrop-blur-sm transition-all hover:border-cream/50 hover:bg-white/15"
                    >
                      {t.hero.secondaryCta}
                    </a>
                  </div>
                  <div data-hero-cta className="relative z-30 pointer-events-auto">
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-cream/30 bg-white/10 px-6 py-3 text-sm font-semibold text-cream backdrop-blur-sm transition-all hover:border-cream/50 hover:bg-white/15"
                    >
                      {t.hero.contactCta}
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
