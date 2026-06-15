"use client";

import { useEffect } from "react";
import { ScrollTrigger, ensurePlugins } from "@/lib/gsap";
import { ReducedMotionProvider } from "@/components/providers/ReducedMotionProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ValuesSection } from "@/components/sections/ValuesSection";
import { LearningSection } from "@/components/sections/LearningSection";
import { OnlineLearningSection } from "@/components/sections/OnlineLearningSection";
import { LeadershipSection } from "@/components/sections/LeadershipSection";
import { VisionSection } from "@/components/sections/VisionSection";
import { ContactSection } from "@/components/sections/ContactSection";

export function HomePageContent() {
  useEffect(() => {
    ensurePlugins();
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  return (
    <ReducedMotionProvider>
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ValuesSection />
        <LearningSection />
        <OnlineLearningSection />
        <LeadershipSection />
        <VisionSection />
        <ContactSection />
      </main>
      <Footer />
    </ReducedMotionProvider>
  );
}
