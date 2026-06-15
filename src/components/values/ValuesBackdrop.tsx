"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const LEAF_COUNT = 22;

export function ValuesBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;

      const leaves = ref.current.querySelectorAll("[data-values-leaf]");
      const orbs = ref.current.querySelectorAll("[data-values-orb]");
      const watermark = ref.current.querySelector("[data-values-watermark]");

      gsap.to(orbs, {
        x: "+=32",
        y: "+=20",
        duration: 9,
        ease: "sine.inOut",
        stagger: 0.5,
        repeat: -1,
        yoyo: true,
      });

      gsap.to(leaves, {
        y: "+=18",
        x: "+=6",
        rotation: "+=10",
        duration: 6,
        ease: "sine.inOut",
        stagger: { each: 0.22, from: "random" },
        repeat: -1,
        yoyo: true,
      });

      if (watermark) {
        gsap.to(watermark, {
          y: "+=12",
          rotation: 1.5,
          duration: 10,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        gsap.to(watermark, {
          y: -30,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      }
    },
    { scope: ref }
  );

  const leaves = Array.from({ length: LEAF_COUNT }, (_, i) => ({
    left: `${4 + ((i * 7.3) % 92)}%`,
    top: `${6 + ((i * 11.7) % 88)}%`,
    width: `${12 + (i % 5) * 5}px`,
    height: `${16 + (i % 5) * 7}px`,
    rotation: -35 + i * 14,
    opacity: 0.12 + (i % 4) * 0.06,
    color: i % 3 === 0 ? "text-gold/30" : "text-emerald/30",
  }));

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(45,138,106,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(201,162,39,0.1),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(250,247,240,0.6),transparent_70%)]" />

      <div
        data-values-orb
        className="absolute -left-32 top-[12%] h-[28rem] w-[28rem] rounded-full bg-emerald/20 blur-[100px]"
      />
      <div
        data-values-orb
        className="absolute -right-24 top-[35%] h-96 w-96 rounded-full bg-gold/18 blur-[90px]"
      />
      <div
        data-values-orb
        className="absolute bottom-[8%] left-1/3 h-80 w-80 rounded-full bg-emerald-light/15 blur-[80px]"
      />

      {leaves.map((leaf, i) => (
        <span
          key={i}
          data-values-leaf
          className={`pointer-events-none absolute ${leaf.color}`}
          style={{
            left: leaf.left,
            top: leaf.top,
            width: leaf.width,
            height: leaf.height,
            transform: `rotate(${leaf.rotation}deg)`,
            opacity: leaf.opacity,
          }}
        >
          <svg viewBox="0 0 24 36" className="h-full w-full" fill="currentColor">
            <path d="M12 2C8 8 4 14 4 22c0 6 3.5 10 8 12 4.5-2 8-6 8-12 0-8-4-14-8-20z" />
          </svg>
        </span>
      ))}

      <div
        data-values-watermark
        className="absolute left-1/2 top-[52%] w-[min(92vw,920px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
      >
        <svg viewBox="0 0 480 520" className="h-auto w-full" fill="none">
          <g stroke="#0d3b2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M80 400 Q240 380 400 400" />
            <path d="M240 400 L240 430" />
            <path d="M80 400 Q240 420 400 400 L390 435 Q240 418 90 435 Z" />
            <path d="M120 410 L200 405 M280 405 L360 410" opacity="0.6" />
            <path d="M228 400 L228 290 Q240 280 252 290 L252 400" />
            <path d="M240 310 Q200 280 170 250" />
            <path d="M240 300 Q280 270 310 240" />
            <path d="M240 330 Q190 310 160 290" />
            <path d="M240 325 Q290 305 320 285" />
            <ellipse cx="240" cy="200" rx="110" ry="95" />
            <ellipse cx="200" cy="225" rx="65" ry="58" />
            <ellipse cx="280" cy="225" rx="65" ry="58" />
            <ellipse cx="240" cy="155" rx="55" ry="48" />
            <path d="M130 180 Q140 160 155 175 Q140 190 130 180" />
            <path d="M350 170 Q360 150 375 165 Q360 180 350 170" />
            <path d="M240 95 Q250 75 265 90 Q250 105 240 95" />
          </g>
        </svg>
      </div>
    </div>
  );
}
