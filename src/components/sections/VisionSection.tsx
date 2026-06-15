"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { SectionHeading } from "@/components/ui/SectionHeading";

const LEAVES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: `${8 + (i * 5.5) % 84}%`,
  size: 12 + (i % 4) * 3,
}));

export function VisionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leavesRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !leavesRef.current) return;

      scrollReveal("[data-vision-text]", {
        trigger: sectionRef.current,
        start: "top 75%",
      });

      const leaves = leavesRef.current.querySelectorAll("[data-leaf]");
      gsap.fromTo(
        leaves,
        { y: 80, opacity: 0.3 },
        {
          y: -120,
          opacity: 0.9,
          duration: 2,
          stagger: 0.08,
          ease: "power1.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            end: "bottom 20%",
            scrub: 1,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="vision"
      className="relative min-h-[70vh] overflow-hidden bg-emerald-deep px-6 py-24 lg:px-8 lg:py-32"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,138,106,0.35),transparent_70%)]" />

      <div ref={leavesRef} className="pointer-events-none absolute inset-0 overflow-hidden">
        {LEAVES.map((leaf) => (
          <div
            key={leaf.id}
            data-leaf
            className="absolute bottom-[20%]"
            style={{ left: leaf.left, width: leaf.size, height: leaf.size * 1.6 }}
          >
            <svg viewBox="0 0 20 32" fill="none" className="h-full w-full">
              <ellipse
                cx="10"
                cy="16"
                rx="8"
                ry="14"
                fill={leaf.id % 3 === 0 ? "#c9a227" : "#2d8a6a"}
                opacity="0.8"
              />
            </svg>
          </div>
        ))}
        <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-gold/15" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <SectionHeading
          title="Learning Today, Leading Tomorrow"
          align="center"
          className="[&_h2]:text-white"
        />

        <p data-vision-text className="text-lg leading-relaxed text-cream md:text-xl">
          We believe education should develop both the mind and character — online and at home. At
          Ash-Shajrah Learning Hub, every child is encouraged to learn with curiosity, grow with
          confidence, act with integrity, and lead with purpose through guided digital learning.
        </p>

        <div
          data-vision-text
          className="mx-auto mt-12 h-px max-w-md bg-gradient-to-r from-transparent via-gold to-transparent"
        />
      </div>
    </section>
  );
}
