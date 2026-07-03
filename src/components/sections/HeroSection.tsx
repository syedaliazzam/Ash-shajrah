"use client";

import { useRef, useCallback } from "react";
import { gsap, useGSAP, ensurePlugins } from "@/lib/gsap";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/data";
import { HeroVideoBackground } from "@/components/hero/HeroVideoBackground";
import { HeroParticles } from "@/components/hero/HeroParticles";
import { HeroWatermark } from "@/components/hero/HeroWatermark";

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
        .from("[data-hero-urdu]", { y: 40, opacity: 0, duration: 1.0 }, "-=0.35")
        .from("[data-hero-en]", { y: 40, opacity: 0, duration: 1.0 }, "-=0.7")
        .from("[data-hero-cta]", { y: 18, opacity: 0, duration: 0.65, stagger: 0.1 }, "-=0.35");
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

      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-emerald-deep/95 via-emerald-deep/80 to-emerald-deep/45" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-emerald-deep/60 via-transparent to-cream/5" />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_15%_40%,rgba(201,162,39,0.12),transparent_55%)]" />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_75%_60%,rgba(45,138,106,0.15),transparent_50%)]" />

      <HeroParticles />
      <HeroWatermark watermarkRef={watermarkRef} />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32 lg:px-10">
        <div ref={contentRef} className="w-full">
          {/* Badge */}
          <span
            data-hero-badge
            className="mb-8 inline-block rounded-full border border-cream/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-gold-soft shadow-sm backdrop-blur-sm"
          >
            Fully Online Early Childhood Learning Hub
          </span>

          {/* ── Two-column hero: English LEFT | Urdu RIGHT ── */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">

            {/* LEFT — English */}
            <div data-hero-en dir="ltr" lang="en" className="text-left flex flex-col">
              <div>
                <h1 className="font-display text-4xl font-bold leading-tight text-cream sm:text-5xl lg:text-6xl xl:text-[4rem]">
                  {SITE.name}
                </h1>
                <p className="mt-4 font-display text-xl font-semibold leading-snug text-gold sm:text-2xl">
                  {SITE.heroTagline}
                </p>
                <p className="mt-4 text-base leading-relaxed text-cream/80 sm:text-lg">
                  {SITE.heroIntro}
                </p>
              </div>

              {/* English CTA */}
              <div className="mt-auto pt-6 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:gap-3">
                <div data-hero-cta>
                  <Button href="/register" variant="primary">
                    Enroll Now
                  </Button>
                </div>
                <div data-hero-cta>
                  <Button href="#approach" variant="secondary">
                    Explore Programs
                  </Button>
                </div>
                <div data-hero-cta>
                  <Button href={SITE.contact.whatsapp} variant="light">
                    Contact on WhatsApp
                  </Button>
                </div>
              </div>
            </div>

            {/* RIGHT — Urdu */}
            <div data-hero-urdu dir="rtl" lang="ur" className="text-right font-urdu flex flex-col">
              <div>
                <h1 className="font-urdu text-4xl font-bold leading-[1.6] text-cream sm:text-5xl lg:text-6xl xl:text-[4rem]">
                  الشجرہ لرننگ ہب
                </h1>
                <p className="font-urdu mt-4 text-xl font-semibold leading-[2] text-gold sm:text-2xl">
                  {SITE.heroUrduTagline}
                </p>
                <p className="font-urdu mt-4 text-base leading-[2.1] text-cream/80 sm:text-lg sm:leading-[2.2]">
                  {SITE.heroUrduIntro}
                </p>
              </div>

              {/* Urdu CTA */}
              <div className="mt-auto pt-6 flex flex-col items-end gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                <a
                  href="/register"
                  className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-emerald-deep shadow-lg shadow-gold/30 transition-all hover:bg-gold-soft hover:shadow-gold/45"
                >
                  داخلہ فارم
                </a>
                <a
                  href={SITE.contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-cream/30 bg-white/10 px-6 py-3 text-sm font-semibold text-cream backdrop-blur-sm transition-all hover:border-cream/50 hover:bg-white/15"
                >
                  واٹس ایپ پر رابطہ کریں
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
