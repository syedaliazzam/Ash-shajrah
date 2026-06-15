"use client";

import { gsap, ScrollTrigger, ensurePlugins } from "@/lib/gsap";

type ScrollRevealOptions = {
  trigger: Element;
  start?: string;
  stagger?: number;
  y?: number;
  x?: number;
};

/** Scroll reveal that keeps content visible until the trigger fires. */
export function scrollReveal(
  targets: gsap.TweenTarget,
  { trigger, start = "top 85%", stagger = 0, y = 40, x = 0 }: ScrollRevealOptions
) {
  ensurePlugins();

  return gsap.from(targets, {
    y,
    x,
    autoAlpha: 0,
    duration: 0.9,
    ease: "power3.out",
    stagger,
    immediateRender: false,
    scrollTrigger: {
      trigger,
      start,
      toggleActions: "play none none none",
      once: true,
    },
  });
}

export { gsap, ScrollTrigger };
