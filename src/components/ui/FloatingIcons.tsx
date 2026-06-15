"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

interface FloatingIcon {
  icon: string;
  x: string;
  y: string;
  delay: number;
  size: string;
}

const ICONS: FloatingIcon[] = [
  { icon: "📖", x: "8%", y: "15%", delay: 0, size: "text-2xl" },
  { icon: "🍃", x: "85%", y: "20%", delay: 0.5, size: "text-xl" },
  { icon: "⭐", x: "12%", y: "70%", delay: 1, size: "text-lg" },
  { icon: "✏️", x: "78%", y: "65%", delay: 1.5, size: "text-xl" },
  { icon: "💡", x: "90%", y: "45%", delay: 0.8, size: "text-2xl" },
  { icon: "🌿", x: "5%", y: "45%", delay: 1.2, size: "text-xl" },
];

export function FloatingIcons() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;

      const items = ref.current.querySelectorAll("[data-float-icon]");
      gsap.to(items, {
        y: "+=20",
        rotation: "+=8",
        duration: 3,
        ease: "sine.inOut",
        stagger: { each: 0.4, from: "random" },
        repeat: -1,
        yoyo: true,
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden">
      {ICONS.map((item, i) => (
        <span
          key={i}
          data-float-icon
          className={`absolute opacity-20 ${item.size}`}
          style={{ left: item.x, top: item.y }}
        >
          {item.icon}
        </span>
      ))}
    </div>
  );
}
