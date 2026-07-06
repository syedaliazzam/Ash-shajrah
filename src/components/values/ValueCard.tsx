"use client";

import { useRef, useCallback } from "react";
import { gsap } from "@/lib/gsap";
import { ValueIcon } from "@/components/values/ValueIcon";

export type ValueCardProps = {
  title: string;
  description: string;
  index: number;
  isActive: boolean;
  language: string;
};

export function ValueCard({ title, description, index, isActive, language }: ValueCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const resetTilt = useCallback(() => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.55,
      ease: "power2.out",
    });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!isActive || !cardRef.current) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      gsap.to(cardRef.current, {
        rotateY: x * 6,
        rotateX: -y * 5,
        duration: 0.35,
        ease: "power2.out",
        overwrite: true,
      });
    },
    [isActive]
  );

  const handleBadgeEnter = () => {
    if (!badgeRef.current) return;
    gsap.to(badgeRef.current, { scale: 1.08, duration: 0.3, ease: "power2.out" });
  };

  const handleBadgeLeave = () => {
    if (!badgeRef.current) return;
    gsap.to(badgeRef.current, { scale: 1, duration: 0.35, ease: "power2.out" });
  };

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      className={`values-card group relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-3xl p-[1px] transition-all duration-700 ease-out sm:min-h-[320px] lg:min-h-[360px] xl:min-h-[380px] ${
        isActive
          ? "values-card--active z-10 scale-[1.06] opacity-100"
          : "scale-[0.94] opacity-[0.72] hover:scale-[0.97] hover:opacity-90"
      }`}
      style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
    >
      {/* Gradient border frame */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-700 ${
          isActive
            ? "bg-gradient-to-br from-gold/70 via-emerald-light/50 to-gold/40 opacity-100"
            : "bg-gradient-to-br from-emerald/25 via-gold/15 to-emerald/20 opacity-80 group-hover:opacity-100"
        }`}
        aria-hidden
      />

      <div
        className={`relative flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-1px)] border backdrop-blur-xl transition-shadow duration-700 ${
          isActive
            ? "values-card-inner--active border-gold/35 bg-gradient-to-br from-white/95 via-cream/90 to-emerald/[0.06] shadow-[0_28px_60px_-12px_rgba(13,59,46,0.28),0_0_0_1px_rgba(201,162,39,0.15)]"
            : "border-white/60 bg-gradient-to-br from-white/88 via-cream/82 to-white/75 shadow-[0_16px_40px_-14px_rgba(13,59,46,0.18)] group-hover:border-emerald/25 group-hover:shadow-[0_22px_48px_-14px_rgba(13,59,46,0.22)]"
        }`}
      >
        {/* Ambient glow orbs */}
        <div
          className={`pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl transition-all duration-700 ${
            isActive ? "bg-gold/30" : "bg-emerald/12 group-hover:bg-emerald/18"
          }`}
          aria-hidden
        />
        <div
          className={`pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full blur-3xl transition-all duration-700 ${
            isActive ? "bg-emerald-light/25" : "bg-gold/8 group-hover:bg-gold/14"
          }`}
          aria-hidden
        />

        {/* Side accent bar */}
        <div
          className={`pointer-events-none absolute bottom-6 left-0 top-6 w-1 rounded-full transition-all duration-700 ${
            isActive
              ? "bg-gradient-to-b from-gold via-gold-soft to-emerald-light shadow-[0_0_12px_rgba(201,162,39,0.45)]"
              : "bg-gradient-to-b from-emerald/30 to-gold/25 group-hover:from-emerald/50 group-hover:to-gold/40"
          }`}
          aria-hidden
        />

        {/* Bottom accent line */}
        <div
          className={`pointer-events-none absolute bottom-0 left-0 right-0 h-[3px] transition-opacity duration-700 ${
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-70"
          }`}
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(201,162,39,0.7), rgba(45,138,106,0.8), rgba(201,162,39,0.7), transparent)",
          }}
          aria-hidden
        />

        <div 
          className="relative flex flex-1 flex-col px-7 py-7 sm:px-8 sm:py-8"
          dir={language === 'ur' ? 'rtl' : 'ltr'}
          lang={language === 'ur' ? 'ur' : 'en'}
        >
          {/* Icon row */}
          <div className="mb-5 flex items-start justify-between gap-4">
            <div
              ref={badgeRef}
              onMouseEnter={handleBadgeEnter}
              onMouseLeave={handleBadgeLeave}
              className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-lg transition-colors duration-500 ${
                isActive
                  ? "border-gold/40 bg-gradient-to-br from-white to-cream/90 shadow-gold/20"
                  : "border-emerald/15 bg-white/80 shadow-emerald-deep/10 group-hover:border-emerald/30"
              }`}
            >
              <ValueIcon
                title={title}
                className={`h-7 w-7 transition-colors duration-500 ${
                  isActive ? "text-emerald-deep" : "text-emerald group-hover:text-emerald-deep"
                }`}
              />
              <span
                className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm ${
                  isActive ? "bg-gold" : "bg-gold/60"
                }`}
                aria-hidden
              />
            </div>

            <span
              className={`font-display text-sm tracking-[0.2em] transition-colors duration-500 ${
                isActive ? "text-gold/80" : "text-emerald/35"
              }`}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          {/* Content */}
          <div className={`mt-4 flex flex-1 flex-col ${language === 'ur' ? 'text-right' : 'text-left'}`}>
            <h3
              className={`${language === 'ur' ? 'font-urdu text-xl font-bold leading-[1.8]' : 'font-display text-lg font-bold leading-tight'} transition-colors duration-500 ${
                isActive ? "text-emerald-deep" : "text-emerald-deep/80 group-hover:text-emerald-deep"
              }`}
            >
              {title}
            </h3>
            <p
              className={`${language === 'ur' ? 'font-urdu mt-2 text-base leading-[2]' : 'mt-2.5 text-sm leading-relaxed'} transition-colors duration-500 ${
                isActive ? "text-emerald-deep/85" : "text-emerald/65 group-hover:text-emerald-deep/75"
              }`}
            >
              {description}
            </p>
          </div>

          {/* Bottom accent line */}
          <div
            className={`mt-5 h-px w-full transition-transform duration-700 ${language === 'ur' ? 'origin-right' : 'origin-left'} ${
              isActive ? "scale-x-100" : "scale-x-[0.35] group-hover:scale-x-75"
            }`}
            style={{
              background:
                "linear-gradient(90deg, rgba(201,162,39,0.55), rgba(45,138,106,0.45), transparent)",
            }}
            aria-hidden
          />
        </div>
      </div>
    </article>
  );
}
