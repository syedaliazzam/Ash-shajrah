"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const ROWS = [
  {
    label: "Delivery",
    value: "Fully Online",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <rect x="3" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <path d="M8 19h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path
          d="M12 9v3M10.5 10.5h3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M18 8.5c1.5.5 2.5 1.5 2.5 2.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Learning",
    value: "Guided & Values-Based",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M12 4C9 9 6 12 6 17c0 2 1.5 3.5 3 4 1.5-.5 3-2 3-4 0-5-3-8-6-13z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M8 18l-2 3M16 18l2 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path d="M9 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Support",
    value: "Parents & Educators",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <circle cx="9" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="16" cy="9" r="2" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M4 19c0-2.5 2-4.5 5-4.5M20 19c0-2-1.5-3.5-3.5-3.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M12 19c0-2.5-1.5-4.5-3-4.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const;

export function OnlineLearningFocusCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!cardRef.current) return;

      const blobs = cardRef.current.querySelectorAll("[data-focus-blob]");

      gsap.to(blobs, {
        y: "+=10",
        x: "+=6",
        duration: 5,
        ease: "sine.inOut",
        stagger: 0.3,
        repeat: -1,
        yoyo: true,
      });

      const onEnter = () => {
        gsap.to(cardRef.current, {
          y: -4,
          boxShadow: "0 28px 60px -12px rgba(13,59,46,0.22), 0 0 40px rgba(201,162,39,0.12)",
          duration: 0.45,
          ease: "power2.out",
        });
      };

      const onLeave = () => {
        gsap.to(cardRef.current, {
          y: 0,
          boxShadow: "0 20px 50px -14px rgba(13,59,46,0.18), 0 0 0 1px rgba(201,162,39,0.12)",
          duration: 0.5,
          ease: "power2.out",
        });
      };

      cardRef.current.addEventListener("mouseenter", onEnter);
      cardRef.current.addEventListener("mouseleave", onLeave);

      return () => {
        cardRef.current?.removeEventListener("mouseenter", onEnter);
        cardRef.current?.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: cardRef }
  );

  return (
    <div
      ref={cardRef}
      className="group relative min-h-[340px] overflow-hidden rounded-3xl border border-emerald/15 bg-gradient-to-br from-white via-cream/95 to-white p-8 shadow-[0_20px_50px_-14px_rgba(13,59,46,0.18),0_0_0_1px_rgba(201,162,39,0.12)] backdrop-blur-md transition-shadow duration-500 md:min-h-[380px] md:p-10 lg:p-11"
    >
      {/* Decorative background */}
      <div
        data-focus-blob
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald/12 blur-3xl"
        aria-hidden
      />
      <div
        data-focus-blob
        className="pointer-events-none absolute -bottom-12 -left-10 h-44 w-44 rounded-full bg-gold/14 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-6 top-1/2 h-28 w-28 -translate-y-1/2 opacity-[0.04]"
        aria-hidden
      >
        <svg viewBox="0 0 480 520" className="h-full w-full" fill="none">
          <g stroke="#0d3b2e" strokeWidth="1.5" strokeLinecap="round">
            <path d="M228 400 L228 290 Q240 280 252 290 L252 400" />
            <ellipse cx="240" cy="200" rx="70" ry="60" />
          </g>
        </svg>
      </div>

      {/* Top badge */}
      <div className="relative mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-xl font-semibold tracking-wide text-[#063F32] sm:text-[1.35rem]">
            Online Learning Focus
          </p>
          <div
            className="mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-gold to-emerald-light"
            aria-hidden
          />
        </div>
        <span className="shrink-0 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8a6f14] sm:text-[11px]">
          Guided Digital Learning
        </span>
      </div>

      {/* Rows */}
      <div className="relative space-y-4">
        {ROWS.map((row, index) => (
          <div
            key={row.label}
            className={`flex items-center gap-4 rounded-2xl border border-emerald/10 bg-white/70 px-4 py-4 shadow-sm shadow-emerald-deep/5 transition-colors duration-300 group-hover:border-emerald/15 sm:gap-5 sm:px-5 sm:py-[1.125rem] ${
              index < ROWS.length - 1 ? "" : ""
            }`}
          >
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald/15 bg-gradient-to-br from-emerald/8 to-gold/10 text-emerald shadow-inner sm:h-[3.25rem] sm:w-[3.25rem]">
              {row.icon}
              <span
                className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-gold/80"
                aria-hidden
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0D5C48] sm:text-xs">
                {row.label}
              </p>
              <p className="mt-1 font-display text-lg font-semibold leading-snug text-[#063F32] sm:text-xl">
                {row.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom highlight strip */}
      <div
        className="relative mt-7 rounded-xl border border-gold/20 bg-gradient-to-r from-emerald/[0.06] via-gold/[0.08] to-emerald/[0.06] px-4 py-3 text-center"
        aria-hidden
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#245C4F] sm:text-[13px]">
          Values <span className="text-gold/80">•</span> Guidance{" "}
          <span className="text-gold/80">•</span> Growth
        </p>
      </div>
    </div>
  );
}
