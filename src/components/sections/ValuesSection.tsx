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
        y: 60,
        opacity: 0,
        duration: 1.15,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: carouselRef.current,
          start: "top 86%",
          once: true,
        },
      });

      const cards = carouselRef.current.querySelectorAll(".values-card");
      if (cards.length) {
        gsap.from(cards, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          stagger: 0.06,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: carouselRef.current,
            start: "top 84%",
            once: true,
          },
        });
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="values"
      className="relative overflow-hidden bg-gradient-to-b from-emerald-deep/[0.07] via-cream to-cream px-5 py-28 sm:px-6 sm:py-32 lg:px-8 lg:py-40"
    >
      <ValuesBackdrop />

      <div className="relative mx-auto max-w-[1400px]">
        <SectionHeading
          title="Our Core Values"
          subtitle="Each value is a leaf on our tree — nurturing character, wisdom, and purpose."
          className="mb-16 sm:mb-20 lg:mb-24 [&_h2]:text-[2.65rem] sm:[&_h2]:text-5xl lg:[&_h2]:text-6xl [&_p]:mt-6 [&_p]:max-w-3xl [&_p]:text-lg sm:[&_p]:text-xl"
        />

        <div ref={carouselRef}>
          <CoreValuesCarousel />
        </div>
      </div>
    </section>
  );
}
