"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VALUES } from "@/lib/data";

function ValueCard({
  title,
  description,
  index,
}: {
  title: string;
  description: string;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: -6,
      scale: 1.02,
      duration: 0.35,
      ease: "power2.out",
    });
  };

  const handleLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      duration: 0.35,
      ease: "power2.out",
    });
  };

  return (
    <div
      ref={cardRef}
      data-value-card
      className="group relative cursor-default overflow-hidden rounded-2xl border border-emerald/10 bg-white p-6 shadow-lg shadow-emerald-deep/5 transition-shadow hover:border-gold/40 hover:shadow-xl hover:shadow-gold/10"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald/10 text-sm font-bold text-emerald-deep">
        {String(index + 1).padStart(2, "0")}
      </div>
      <h3 className="font-display text-xl font-semibold text-emerald-deep">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-emerald/80">{description}</p>
      <div className="mt-4 h-0.5 w-0 bg-gradient-to-r from-gold to-emerald-light transition-all duration-500 group-hover:w-full" />
    </div>
  );
}

export function ValuesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      ScrollTrigger.batch("[data-value-card]", {
        onEnter: (elements) => {
          gsap.from(elements, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power3.out",
            immediateRender: false,
            overwrite: true,
          });
        },
        start: "top 90%",
        once: true,
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="values"
      className="relative overflow-hidden bg-gradient-to-b from-emerald-deep/5 via-cream to-cream px-6 py-24 lg:px-8 lg:py-32"
    >
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald/5" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          title="Our Core Values"
          subtitle="Each value is a leaf on our tree — nurturing character, wisdom, and purpose."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {VALUES.map((value, i) => (
            <ValueCard
              key={value.title}
              title={value.title}
              description={value.description}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
