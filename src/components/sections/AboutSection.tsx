"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FloatingIcons } from "@/components/ui/FloatingIcons";
import { OnlineLearningFocusCard } from "@/components/about/OnlineLearningFocusCard";

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      scrollReveal("[data-about-text]", {
        trigger: sectionRef.current,
        start: "top 75%",
      });

      scrollReveal("[data-about-card]", {
        trigger: sectionRef.current,
        start: "top 70%",
        x: 40,
        y: 0,
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative overflow-hidden px-6 py-24 lg:px-8 lg:py-32"
    >
      <FloatingIcons />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald/[0.03] to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading title="About Ash-Shajrah Learning Hub" />

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <p data-about-text className="text-lg leading-relaxed text-emerald md:text-xl">
            Ash-Shajrah Learning Hub is a fully online learning and development platform for
            children, parents, and educators. We nurture young minds through meaningful virtual
            learning, strong values, creativity, discipline, and leadership — helping children
            grow academically, emotionally, socially, and morally with guided online support from
            home.
          </p>

          <div data-about-card>
            <OnlineLearningFocusCard />
          </div>
        </div>
      </div>
    </section>
  );
}
