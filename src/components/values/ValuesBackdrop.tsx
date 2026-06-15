"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const LEAF_COUNT = 10;

export function ValuesBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;

      const leaves = ref.current.querySelectorAll("[data-values-leaf]");
      const orbs = ref.current.querySelectorAll("[data-values-orb]");

      gsap.to(orbs, {
        x: "+=24",
        y: "+=16",
        duration: 7,
        ease: "sine.inOut",
        stagger: 0.4,
        repeat: -1,
        yoyo: true,
      });

      gsap.to(leaves, {
        y: "+=14",
        rotation: "+=8",
        duration: 5,
        ease: "sine.inOut",
        stagger: { each: 0.3, from: "random" },
        repeat: -1,
        yoyo: true,
      });
    },
    { scope: ref }
  );

  const leaves = Array.from({ length: LEAF_COUNT }, (_, i) => ({
    left: `${8 + ((i * 9) % 84)}%`,
    top: `${12 + ((i * 13) % 76)}%`,
    width: `${10 + (i % 4) * 4}px`,
    height: `${14 + (i % 4) * 6}px`,
    rotation: -30 + i * 18,
    opacity: 0.15 + (i % 3) * 0.08,
  }));

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        data-values-orb
        className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-emerald/15 blur-3xl"
      />
      <div
        data-values-orb
        className="absolute -right-16 bottom-1/4 h-64 w-64 rounded-full bg-gold/12 blur-3xl"
      />
      <div
        data-values-orb
        className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-light/10 blur-3xl"
      />

      {leaves.map((leaf, i) => (
        <span
          key={i}
          data-values-leaf
          className="pointer-events-none absolute text-emerald/25"
          style={{
            left: leaf.left,
            top: leaf.top,
            width: leaf.width,
            height: leaf.height,
            transform: `rotate(${leaf.rotation}deg)`,
            opacity: leaf.opacity,
          }}
          aria-hidden
        >
          <svg viewBox="0 0 24 36" className="h-full w-full" fill="currentColor">
            <path d="M12 2C8 8 4 14 4 22c0 6 3.5 10 8 12 4.5-2 8-6 8-12 0-8-4-14-8-20z" />
          </svg>
        </span>
      ))}

      <div
        data-values-leaf
        className="absolute left-1/2 top-1/2 w-[min(70vw,520px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.045]"
      >
        <svg viewBox="0 0 480 520" className="h-auto w-full" fill="none">
          <g stroke="#0d3b2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M80 400 Q240 380 400 400" />
            <path d="M240 400 L240 430" />
            <path d="M80 400 Q240 420 400 400 L390 435 Q240 418 90 435 Z" />
            <path d="M228 400 L228 290 Q240 280 252 290 L252 400" />
            <path d="M240 310 Q200 280 170 250" />
            <path d="M240 300 Q280 270 310 240" />
            <ellipse cx="240" cy="200" rx="110" ry="95" />
            <ellipse cx="200" cy="225" rx="65" ry="58" />
            <ellipse cx="280" cy="225" rx="65" ry="58" />
            <path d="M240 95 Q250 75 265 90 Q250 105 240 95" />
          </g>
        </svg>
      </div>
    </div>
  );
}
