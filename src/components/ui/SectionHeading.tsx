"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  title,
  subtitle,
  className = "",
  align = "center",
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      scrollReveal(ref.current.querySelectorAll("[data-animate]"), {
        trigger: ref.current,
        stagger: 0.12,
      });
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      className={`mb-14 md:mb-16 ${align === "center" ? "text-center" : "text-left"} ${className}`}
    >
      <h2
        data-animate
        className="font-display text-4xl font-semibold tracking-tight text-emerald-deep md:text-5xl lg:text-6xl"
      >
        {title}
      </h2>
      {subtitle && (
        <p
          data-animate
          className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-emerald md:text-lg"
        >
          {subtitle}
        </p>
      )}
      <div
        data-animate
        className={`mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-gold to-emerald-light ${align === "center" ? "mx-auto" : ""}`}
      />
    </div>
  );
}
