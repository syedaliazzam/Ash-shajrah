"use client";

import { useEffect } from "react";
import { ScrollTrigger, ensurePlugins } from "@/lib/gsap";
import { ReducedMotionProvider } from "@/components/providers/ReducedMotionProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { LearningCharacterLeadershipSection } from "@/components/sections/LearningCharacterLeadershipSection";
import { ParentPartnershipSection } from "@/components/sections/ParentPartnershipSection";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { ValuesSection } from "@/components/sections/ValuesSection";
import { LearningSection } from "@/components/sections/LearningSection";
import { CurriculumSection } from "@/components/sections/CurriculumSection";
import { OnlineLearningSection } from "@/components/sections/OnlineLearningSection";
import { LeadershipSection } from "@/components/sections/LeadershipSection";
import { OurWorksSection } from "@/components/sections/OurWorksSection";
import { OurEventsSection } from "@/components/sections/OurEventsSection";
import { VisionSection } from "@/components/sections/VisionSection";
import { LogoPhilosophySection } from "@/components/sections/LogoPhilosophySection";

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
        <LearningCharacterLeadershipSection />
        <ParentPartnershipSection />
        <ProgramsSection />
        <ValuesSection />
        <LearningSection />
        <CurriculumSection />
        <OnlineLearningSection />
        <LeadershipSection />
        <OurWorksSection />
        <OurEventsSection />
        <VisionSection />
        <LogoPhilosophySection />
      </main>
      <Footer />
    </ReducedMotionProvider>
  );
}
