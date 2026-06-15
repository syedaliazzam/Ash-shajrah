"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FloatingIcons } from "@/components/ui/FloatingIcons";

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

          <div
            data-about-card
            className="glass-card glow-emerald relative overflow-hidden p-8 md:p-10"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald/10" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gold/10" />

            <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-emerald/60">
              Online Learning Focus
            </p>

            <div className="relative space-y-6">
              {[
                { label: "Delivery", value: "Fully Online" },
                { label: "Learning", value: "Guided & Values-Based" },
                { label: "Support", value: "Parents & Educators" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between border-b border-emerald/10 pb-4 last:border-0 last:pb-0"
                >
                  <span className="text-sm font-medium uppercase tracking-wider text-emerald/70">
                    {item.label}
                  </span>
                  <span className="font-display text-lg font-semibold text-emerald-deep">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
