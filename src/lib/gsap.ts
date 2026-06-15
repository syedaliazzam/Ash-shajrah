"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

let registered = false;

function ensurePlugins() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  registered = true;
}

if (typeof window !== "undefined") {
  ensurePlugins();
}

export { gsap, ScrollTrigger, useGSAP, ensurePlugins };
