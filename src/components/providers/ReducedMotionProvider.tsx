"use client";

import { useEffect } from "react";
import { gsap, ensurePlugins } from "@/lib/gsap";

export function ReducedMotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ensurePlugins();

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.defaults({ duration: 0, ease: "none" });

      return () => {
        gsap.defaults({ duration: 0.5, ease: "power1.out" });
      };
    });

    return () => mm.revert();
  }, []);

  return <>{children}</>;
}
