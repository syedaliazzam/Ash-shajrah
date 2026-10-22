"use client";

import { useEffect } from "react";
import { ScrollTrigger, ensurePlugins } from "@/lib/gsap";
import { ReducedMotionProvider } from "@/components/providers/ReducedMotionProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { MonthlyPlansSection } from "@/components/sections/MonthlyPlansSection";
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
import { NeedBasedScholarshipSection } from "@/components/sections/NeedBasedScholarshipSection";
import { LogoPhilosophySection } from "@/components/sections/LogoPhilosophySection";
import { UpcomingEventAlert } from "@/components/sections/UpcomingEventAlert";
import type { PublicEvent } from "@/lib/public-events";
import type { MonthlyPlansData } from "@/lib/monthly-plans";
import type { CurriculumEvent } from "@/lib/curriculum-events";

export function HomePageContent({
  initialUpcomingEvent = null,
  initialPastEvents = [],
  initialMonthlyPlans = null,
  initialCurriculumEvents = [],
}: {
  initialUpcomingEvent?: PublicEvent | null;
  initialPastEvents?: PublicEvent[];
  initialMonthlyPlans?: MonthlyPlansData | null;
  initialCurriculumEvents?: CurriculumEvent[];
}) {
  useEffect(() => {
    ensurePlugins();
    // Refresh ScrollTrigger immediately and after short intervals
    // so sections below render right away without waiting for all remote media
    ScrollTrigger.refresh();
    const t1 = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    const t2 = window.setTimeout(() => ScrollTrigger.refresh(), 1000);
    const t3 = window.setTimeout(() => ScrollTrigger.refresh(), 2500);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener("load", refresh);
    };
  }, []);

  return (
    <ReducedMotionProvider>
      <Header />
      <UpcomingEventAlert initialEvent={initialUpcomingEvent} />
      <main>
        <HeroSection />
        <MonthlyPlansSection initialData={initialMonthlyPlans} />
        <AboutSection />
        <LearningCharacterLeadershipSection />
        <ParentPartnershipSection />
        <ProgramsSection />
        <ValuesSection />
        <LearningSection />
        <CurriculumSection initialCurriculumEvents={initialCurriculumEvents} />
        <OnlineLearningSection />
        <LeadershipSection />
        <OurWorksSection />
        <OurEventsSection initialPastEvents={initialPastEvents} />
        <VisionSection />
        <NeedBasedScholarshipSection />
        <LogoPhilosophySection />
      </main>
      <Footer />
    </ReducedMotionProvider>
  );
}
