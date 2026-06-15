"use client";

import { gsap, useGSAP } from "@/lib/gsap";

type HeroWatermarkProps = {
  watermarkRef: React.RefObject<HTMLDivElement | null>;
};

export function HeroWatermark({ watermarkRef }: HeroWatermarkProps) {
  useGSAP(
    () => {
      if (!watermarkRef.current) return;

      gsap.from(watermarkRef.current, {
        opacity: 0,
        scale: 0.94,
        duration: 2,
        ease: "power2.out",
        delay: 0.4,
      });

      gsap.to(watermarkRef.current, {
        rotation: 1.5,
        duration: 8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
    { scope: watermarkRef }
  );

  return (
    <div
      ref={watermarkRef}
      className="pointer-events-none absolute -right-[8%] top-1/2 z-[3] hidden w-[min(52vw,620px)] -translate-y-1/2 opacity-[0.14] lg:block xl:-right-[4%] xl:w-[min(48vw,680px)]"
      aria-hidden
    >
      <svg viewBox="0 0 480 520" className="h-auto w-full" fill="none">
        <g stroke="#faf7f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Open book base */}
          <path d="M80 400 Q240 380 400 400" opacity="0.7" />
          <path d="M240 400 L240 430" opacity="0.5" />
          <path d="M80 400 Q240 420 400 400 L390 435 Q240 418 90 435 Z" opacity="0.55" />
          <path d="M120 410 L200 405 M280 405 L360 410" opacity="0.35" />

          {/* Tree trunk */}
          <path d="M228 400 L228 290 Q240 280 252 290 L252 400" opacity="0.65" />

          {/* Branches */}
          <path d="M240 310 Q200 280 170 250" opacity="0.5" />
          <path d="M240 300 Q280 270 310 240" opacity="0.5" />
          <path d="M240 330 Q190 310 160 290" opacity="0.4" />
          <path d="M240 325 Q290 305 320 285" opacity="0.4" />

          {/* Canopy outline */}
          <ellipse cx="240" cy="200" rx="110" ry="95" opacity="0.6" />
          <ellipse cx="200" cy="225" rx="65" ry="58" opacity="0.45" />
          <ellipse cx="280" cy="225" rx="65" ry="58" opacity="0.45" />
          <ellipse cx="240" cy="155" rx="55" ry="48" opacity="0.5" />

          {/* Floating leaves */}
          <path d="M130 180 Q140 160 155 175 Q140 190 130 180" opacity="0.55" />
          <path d="M350 170 Q360 150 375 165 Q360 180 350 170" opacity="0.55" />
          <path d="M100 280 Q110 260 125 275 Q110 290 100 280" opacity="0.45" />
          <path d="M380 270 Q390 250 405 265 Q390 280 380 270" opacity="0.45" />
          <path d="M240 95 Q250 75 265 90 Q250 105 240 95" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}
