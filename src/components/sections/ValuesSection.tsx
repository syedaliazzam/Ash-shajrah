"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CoreValuesCarousel } from "@/components/values/CoreValuesCarousel";
import { ValuesBackdrop } from "@/components/values/ValuesBackdrop";

export function ValuesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!carouselRef.current) return;

      gsap.from(carouselRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: carouselRef.current,
          start: "top 88%",
          once: true,
        },
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
      <ValuesBackdrop />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          title="Our Core Values"
          subtitle="Each value is a leaf on our tree — nurturing character, wisdom, and purpose."
        />

        <div ref={carouselRef}>
          <CoreValuesCarousel />
        </div>
      </div>
    </section>
  );
}
