"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import { gsap, useGSAP, ensurePlugins } from "@/lib/gsap";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { HeroVideoBackground } from "@/components/hero/HeroVideoBackground";
import { HeroParticles } from "@/components/hero/HeroParticles";
import { HeroWatermark } from "@/components/hero/HeroWatermark";
import { REGISTER_URL, WHATSAPP_URL, EDI_FACEBOOK_URL } from "@/lib/constants";

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

      tl.from("[data-hero-supervision]", { y: -12, opacity: 0, duration: 0.7 })
        .from("[data-hero-content]", { y: 40, opacity: 0, duration: 1.0 }, "-=0.15")
        .from("[data-hero-cta]", { y: 18, opacity: 0, duration: 0.65, stagger: 0.1 }, "-=0.35");
    },
    { scope: sectionRef }
  );

  const { t, language } = useLanguage();
  const isUrdu = language === "ur";

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;
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
      className="relative flex min-h-[100svh] items-center overflow-hidden"
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

      <div
        data-hero-supervision
        className="pointer-events-auto absolute left-1/2 top-20 z-40 w-full max-w-[92vw] -translate-x-1/2 px-4 sm:top-28 sm:max-w-2xl md:top-32"
      >
        <p
          className={`relative z-30 mx-auto w-fit max-w-[90vw] rounded-full border border-gold/50 bg-white/10 px-4 py-2 text-center text-cream shadow-sm backdrop-blur-md sm:px-6 sm:py-3 ${
            isUrdu
              ? "font-urdu text-base leading-relaxed sm:text-lg md:text-xl"
              : "text-sm font-medium tracking-wide sm:text-base"
          }`}
        >
          <span>{t.brand.supervisionPrefix} </span>
          <a
            href={EDI_FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative z-40 pointer-events-auto text-gold underline-offset-4 transition hover:text-yellow-300 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
              isUrdu ? "font-urdu text-base sm:text-lg md:text-xl" : "font-semibold"
            }`}
          >
            {t.brand.supervisionName}
          </a>
        </p>
      </div>

      <div className="pointer-events-none relative z-20 mx-auto flex min-h-[100svh] w-full max-w-7xl items-center px-4 pb-24 pt-40 sm:px-8 sm:pb-24 sm:pt-44 lg:px-10 lg:pt-48">
        <div ref={contentRef} className="relative z-30 w-full max-w-full pointer-events-auto">


          <div data-hero-content className={`flex w-full max-w-full flex-col ${isUrdu ? 'text-right font-urdu items-end' : 'text-left items-start'}`}>
            <div className="w-full max-w-3xl">
              <h1
                className={`${isUrdu ? "font-urdu leading-[1.65]" : "font-display leading-tight"} text-3xl font-bold text-cream sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4rem]`}
              >
                {t.hero.title}
              </h1>
              <p className={`mt-3 sm:mt-4 ${language === 'ur' ? 'font-urdu leading-[2]' : 'font-display leading-snug'} text-lg font-semibold text-gold sm:text-xl md:text-2xl`}>
                {t.hero.subtitle}
              </p>
              <p className={`mt-3 sm:mt-4 ${language === 'ur' ? 'font-urdu leading-[2.1] sm:leading-[2.2]' : 'leading-relaxed'} text-base text-cream/80 sm:text-lg`}>
                {t.hero.description}
              </p>
            </div>

            <div className={`mt-8 flex w-full max-w-xl flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-3 ${language === 'ur' ? 'items-stretch sm:items-center sm:justify-end' : 'items-stretch sm:items-start'}`}>
              {language === 'en' ? (
                <>
                  <div data-hero-cta className="relative z-30 w-full pointer-events-auto sm:w-auto">
                    <Button href={REGISTER_URL} variant="primary" className="w-full sm:w-auto">
                      {t.hero.primaryCta}
                    </Button>
                  </div>
                  <div data-hero-cta className="relative z-30 w-full pointer-events-auto sm:w-auto">
                    <Button href="/#programs" variant="secondary" className="w-full sm:w-auto">
                      {t.hero.secondaryCta}
                    </Button>
                  </div>
                  <div data-hero-cta className="relative z-30 w-full pointer-events-auto sm:w-auto">
                    <Button href={WHATSAPP_URL} variant="light" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                      {t.hero.contactCta}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div data-hero-cta className="relative z-30 w-full pointer-events-auto sm:w-auto">
                    <Link
                      href={REGISTER_URL}
                      className="inline-flex min-h-[44px] w-full min-w-[44px] items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-semibold text-emerald-deep shadow-lg shadow-gold/30 transition-all hover:bg-gold-soft hover:shadow-gold/45 sm:w-auto"
                    >
                      {t.hero.primaryCta}
                    </Link>
                  </div>
                  <div data-hero-cta className="relative z-30 w-full pointer-events-auto sm:w-auto">
                    <Link
                      href="/#programs"
                      className="inline-flex min-h-[44px] w-full min-w-[44px] items-center justify-center rounded-full border border-cream/30 bg-white/10 px-6 py-3 text-sm font-semibold text-cream backdrop-blur-sm transition-all hover:border-cream/50 hover:bg-white/15 sm:w-auto"
                    >
                      {t.hero.secondaryCta}
                    </Link>
                  </div>
                  <div data-hero-cta className="relative z-30 w-full pointer-events-auto sm:w-auto">
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] w-full min-w-[44px] items-center justify-center rounded-full border border-cream/30 bg-white/10 px-6 py-3 text-sm font-semibold text-cream backdrop-blur-sm transition-all hover:border-cream/50 hover:bg-white/15 sm:w-auto"
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
