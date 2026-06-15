"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Animated fallback when hero video is loading or unavailable — online learning aesthetic */
export function OnlineLearningBackdrop({ active = true }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current || !active) return;

      gsap.to("[data-backdrop-orb]", {
        scale: 1.08,
        opacity: 0.55,
        duration: 4,
        ease: "sine.inOut",
        stagger: { each: 0.6, from: "random" },
        repeat: -1,
        yoyo: true,
      });

      gsap.to("[data-backdrop-float]", {
        y: "+=18",
        duration: 3.5,
        ease: "sine.inOut",
        stagger: { each: 0.4, from: "random" },
        repeat: -1,
        yoyo: true,
      });
    },
    { scope: ref, dependencies: [active] }
  );

  return (
    <div
      ref={ref}
      className={`absolute inset-0 transition-opacity duration-700 ${active ? "opacity-100" : "opacity-0"}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-deep via-[#0f4a38] to-emerald-deep" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(201,162,39,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_70%,rgba(45,138,106,0.25),transparent_50%)]" />

      {/* Soft grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(250,247,240,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(250,247,240,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glowing orbs */}
      <div data-backdrop-orb className="absolute left-[15%] top-[20%] h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
      <div data-backdrop-orb className="absolute right-[10%] top-[35%] h-64 w-64 rounded-full bg-emerald-light/15 blur-3xl" />
      <div data-backdrop-orb className="absolute bottom-[15%] left-[40%] h-40 w-40 rounded-full bg-gold/10 blur-2xl" />

      {/* Video call mockup */}
      <div
        data-backdrop-float
        className="absolute right-[8%] top-[22%] hidden w-52 rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-md lg:block xl:w-60"
      >
        <div className="mb-2 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-light" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-cream/70">
            Live Session
          </span>
        </div>
        <div className="aspect-video rounded-xl bg-gradient-to-br from-emerald/40 to-emerald-deep/60" />
        <div className="mt-2 flex gap-1.5">
          <div className="h-1.5 flex-1 rounded-full bg-gold/40" />
          <div className="h-1.5 w-8 rounded-full bg-cream/20" />
        </div>
      </div>

      {/* Tablet / book learning scene */}
      <div
        data-backdrop-float
        className="absolute bottom-[18%] right-[18%] hidden w-44 rounded-2xl border border-white/15 bg-white/8 p-3 backdrop-blur-sm lg:block"
      >
        <div className="flex gap-2">
          <div className="h-16 w-12 rounded-lg bg-gradient-to-b from-gold/30 to-gold/10" />
          <div className="flex-1 space-y-1.5 pt-1">
            <div className="h-1.5 w-full rounded bg-cream/25" />
            <div className="h-1.5 w-4/5 rounded bg-cream/15" />
            <div className="h-1.5 w-3/5 rounded bg-emerald-light/30" />
          </div>
        </div>
      </div>

      {/* Laptop silhouette */}
      <div
        data-backdrop-float
        className="absolute bottom-[25%] left-[12%] hidden lg:block"
      >
        <div className="h-28 w-44 rounded-t-xl border border-white/20 bg-gradient-to-b from-white/15 to-white/5 p-2">
          <div className="h-full w-full rounded-lg bg-emerald-deep/50" />
        </div>
        <div className="mx-auto h-2 w-52 rounded-b-lg bg-white/10" />
      </div>

      {/* Floating particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          data-backdrop-float
          className="absolute rounded-full bg-gold/50"
          style={{
            left: `${10 + (i * 7.5) % 80}%`,
            top: `${12 + (i * 11) % 75}%`,
            width: 3 + (i % 2),
            height: 3 + (i % 2),
          }}
        />
      ))}
    </div>
  );
}
