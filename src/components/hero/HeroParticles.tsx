"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const LEAF_COUNT = 14;
const GOLD_COUNT = 22;

function LeafShape({
  className,
  style,
  ...props
}: {
  className?: string;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={className} style={style} {...props}>
      <svg viewBox="0 0 24 36" className="h-full w-full" aria-hidden fill="currentColor">
        <path d="M12 2C8 8 4 14 4 22c0 6 3.5 10 8 12 4.5-2 8-6 8-12 0-8-4-14-8-20z" />
      </svg>
    </span>
  );
}

export function HeroParticles() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;

      const leaves = ref.current.querySelectorAll("[data-hero-leaf]");
      const gold = ref.current.querySelectorAll("[data-hero-gold]");

      gsap.from([...leaves, ...gold], {
        opacity: 0,
        duration: 1.2,
        stagger: 0.04,
        ease: "power2.out",
        delay: 0.6,
      });

      gsap.to(leaves, {
        y: "+=18",
        x: "+=6",
        rotation: "+=12",
        duration: 4.5,
        ease: "sine.inOut",
        stagger: { each: 0.35, from: "random" },
        repeat: -1,
        yoyo: true,
      });

      gsap.to(gold, {
        y: "-=40",
        opacity: 0,
        duration: 5,
        ease: "none",
        stagger: { each: 0.25, from: "random" },
        repeat: -1,
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
      {Array.from({ length: LEAF_COUNT }).map((_, i) => (
        <LeafShape
          key={`leaf-${i}`}
          data-hero-leaf
          className={`absolute text-emerald-light/50 ${i % 3 === 0 ? "text-gold/40" : ""}`}
          style={{
            left: `${5 + (i * 6.8) % 90}%`,
            top: `${8 + (i * 11) % 75}%`,
            width: 14 + (i % 4) * 4,
            height: 20 + (i % 4) * 6,
            transform: `rotate(${-30 + (i * 17) % 60}deg)`,
          }}
        />
      ))}

      {Array.from({ length: GOLD_COUNT }).map((_, i) => (
        <span
          key={`gold-${i}`}
          data-hero-gold
          className="absolute rounded-full bg-gold shadow-[0_0_12px_rgba(201,162,39,0.6)]"
          style={{
            left: `${3 + (i * 4.5) % 94}%`,
            top: `${12 + (i * 7.5) % 80}%`,
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            opacity: 0.35 + (i % 4) * 0.12,
          }}
        />
      ))}
    </div>
  );
}
