"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { HERO_GLASS_CARDS } from "@/lib/data";

export function HeroGlassCards() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;

      const cards = ref.current.querySelectorAll("[data-glass-card]");

      gsap.from(cards, {
        opacity: 0,
        y: 30,
        scale: 0.92,
        duration: 0.9,
        stagger: 0.15,
        ease: "power3.out",
        delay: 1.1,
      });

      gsap.to(cards, {
        y: "+=10",
        duration: 3.2,
        ease: "sine.inOut",
        stagger: { each: 0.4, from: "random" },
        repeat: -1,
        yoyo: true,
      });
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 z-[5] hidden lg:block"
      aria-hidden
    >
      {HERO_GLASS_CARDS.map((card) => (
        <div
          key={card.label}
          data-glass-card
          className="hero-glass-card absolute flex items-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 shadow-lg shadow-emerald-deep/20 backdrop-blur-md"
          style={{ left: card.x, top: card.y }}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/15 text-sm text-gold">
            {card.icon}
          </span>
          <span className="max-w-[9rem] text-xs font-semibold leading-snug tracking-wide text-cream xl:max-w-[10rem] xl:text-sm">
            {card.label}
          </span>
        </div>
      ))}
    </div>
  );
}
