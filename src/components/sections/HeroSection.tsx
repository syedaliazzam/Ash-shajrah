"use client";

import { useRef, useCallback } from "react";
import { gsap, useGSAP, ensurePlugins } from "@/lib/gsap";
import { Button } from "@/components/ui/Button";
import { SITE, HERO_MOBILE_PILLS } from "@/lib/data";
import { HeroVideoBackground } from "@/components/hero/HeroVideoBackground";
import { HeroParticles } from "@/components/hero/HeroParticles";
import { HeroWatermark } from "@/components/hero/HeroWatermark";
import { HeroGlassCards } from "@/components/hero/HeroGlassCards";

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
        .from("[data-hero-title]", { y: 50, opacity: 0, duration: 1.1 }, "-=0.35")
        .from("[data-hero-tagline]", { y: 28, opacity: 0, duration: 0.9 }, "-=0.55")
        .from("[data-hero-intro]", { y: 22, opacity: 0, duration: 0.85 }, "-=0.45")
        .from("[data-hero-cta]", { y: 18, opacity: 0, duration: 0.65, stagger: 0.1 }, "-=0.35")
        .from("[data-hero-mobile-card]", { y: 20, opacity: 0, duration: 0.7, stagger: 0.1 }, "-=0.4");
    },
    { scope: sectionRef }
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current || !contentRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: -((e.clientY - rect.top) / rect.height - 0.5) * 2,
    };

    gsap.to(contentRef.current, {
      x: mouseRef.current.x * 12,
      y: mouseRef.current.y * 8,
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

      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-emerald-deep/92 via-emerald-deep/72 to-emerald-deep/35" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-emerald-deep/55 via-transparent to-cream/8" />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_15%_40%,rgba(201,162,39,0.12),transparent_55%)]" />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_75%_60%,rgba(45,138,106,0.15),transparent_50%)]" />

      <HeroParticles />
      <HeroWatermark watermarkRef={watermarkRef} />
      <HeroGlassCards />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32 lg:px-10">
        <div ref={contentRef} className="w-full max-w-2xl lg:max-w-3xl">
          <span
            data-hero-badge
            className="mb-6 inline-block rounded-full border border-cream/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-gold-soft shadow-sm backdrop-blur-sm"
          >
            Fully Online Learning Hub
          </span>

          <h1
            data-hero-title
            className="font-display text-[2.35rem] font-bold leading-[1.06] text-cream sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            {SITE.name}
          </h1>

          <p
            data-hero-tagline
            className="mt-5 max-w-xl font-display text-lg font-medium leading-snug text-gold sm:text-xl lg:mt-6 lg:text-2xl"
          >
            {SITE.heroTagline}
          </p>

          <p
            data-hero-intro
            className="mt-5 max-w-xl text-base leading-relaxed text-cream/85 sm:mt-6 sm:text-lg"
          >
            {SITE.heroIntro}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-3">
            <div data-hero-cta>
              <Button href="#approach" variant="primary">
                Explore Online Programs
              </Button>
            </div>
            <div data-hero-cta>
              <Button href="#contact" variant="secondary">
                Book a Consultation
              </Button>
            </div>
            <div data-hero-cta>
              <Button href={SITE.contact.whatsapp} variant="light">
                Contact on WhatsApp
              </Button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:hidden">
            {HERO_MOBILE_PILLS.map((label) => (
              <div
                key={label}
                data-hero-mobile-card
                className="hero-glass-card rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-center text-[11px] font-semibold leading-snug text-cream backdrop-blur-md sm:px-4 sm:text-xs"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 sm:bottom-8">
        <div className="flex flex-col items-center gap-2 text-cream/45">
          <span className="text-[10px] uppercase tracking-[0.25em]">Discover</span>
          <div className="h-9 w-5 rounded-full border-2 border-cream/25 p-1">
            <div className="h-1.5 w-full animate-bounce rounded-full bg-gold/50" />
          </div>
        </div>
      </div>
    </section>
  );
}
