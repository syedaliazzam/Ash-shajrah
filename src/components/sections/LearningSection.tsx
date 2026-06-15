"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LearningIcon } from "@/components/ui/LearningIcon";
import { LEARNING_PILLARS } from "@/lib/data";

function PillarCard({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: string;
  index: number;
}) {
  const cardRef = useRef<HTMLElement>(null);

  const handleEnter = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: -8,
      scale: 1.02,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  return (
    <article
      ref={cardRef}
      data-pillar-card
      className="learning-pillar-card group relative overflow-hidden rounded-2xl p-[1px]"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald/30 via-gold/20 to-emerald/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col rounded-2xl border border-emerald/10 bg-white/70 p-6 shadow-lg shadow-emerald-deep/5 backdrop-blur-md transition-all duration-500 group-hover:border-gold/35 group-hover:bg-white/85 group-hover:shadow-xl group-hover:shadow-emerald/10">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold/10 blur-2xl transition-all group-hover:bg-gold/20" />

        <div className="relative mb-5 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald/15 bg-gradient-to-br from-emerald/10 to-gold/10 text-emerald shadow-inner transition-all duration-500 group-hover:border-gold/30 group-hover:shadow-gold/20">
            <LearningIcon name={icon} className="h-6 w-6" />
          </div>
          <span className="font-display text-sm font-semibold text-gold/60">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h3 className="font-display text-lg font-semibold leading-snug text-emerald-deep">
          {title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-emerald/80">{description}</p>

        <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald/50 transition-colors group-hover:text-gold">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald/20 to-gold/40 group-hover:via-gold/40" />
          Online
        </div>
      </div>
    </article>
  );
}

export function LearningSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      gsap.to("[data-learning-orb]", {
        y: "+=25",
        x: "+=12",
        duration: 5,
        ease: "sine.inOut",
        stagger: { each: 0.8, from: "random" },
        repeat: -1,
        yoyo: true,
      });

      scrollReveal("[data-pillar-card]", {
        trigger: sectionRef.current,
        start: "top 68%",
        stagger: 0.08,
        y: 55,
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="approach"
      className="learning-section relative overflow-hidden px-6 py-24 lg:px-8 lg:py-32"
    >
      {/* Layered background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream-dark/30 to-cream" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#0d3b2e 1px, transparent 1px), linear-gradient(90deg, #0d3b2e 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        data-learning-orb
        className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-emerald/10 blur-3xl"
      />
      <div
        data-learning-orb
        className="absolute -right-16 bottom-1/4 h-64 w-64 rounded-full bg-gold/10 blur-3xl"
      />

      {/* Floating leaves */}
      {["🍃", "✦", "🍃"].map((leaf, i) => (
        <span
          key={i}
          className="pointer-events-none absolute text-lg opacity-10"
          style={{ left: `${15 + i * 35}%`, top: `${20 + i * 25}%` }}
        >
          {leaf}
        </span>
      ))}

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          title="A Holistic Online Learning Experience"
          subtitle="Premium digital learning designed for early years growth, values, creativity, and confident participation — all from home."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {LEARNING_PILLARS.map((pillar, i) => (
            <PillarCard
              key={pillar.title}
              title={pillar.title}
              description={pillar.description}
              icon={pillar.icon}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
