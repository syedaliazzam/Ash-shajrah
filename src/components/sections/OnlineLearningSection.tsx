"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LearningIcon } from "@/components/ui/LearningIcon";
import { ONLINE_STEPS } from "@/lib/data";

/** High-contrast readable palette for parent-facing copy */
const TEXT = {
  heading: "text-[#063F32]",
  title: "text-[#063F32]",
  body: "text-[#245C4F]",
  label: "text-[#0D5C48]",
} as const;

function VideoCallMockup() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald/15 bg-white/85 p-5 shadow-2xl shadow-emerald-deep/10 backdrop-blur-md sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-light" />
          <span
            className={`text-sm font-semibold uppercase tracking-wider sm:text-[0.9375rem] ${TEXT.label}`}
          >
            Online Session
          </span>
        </div>
        <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-[#8a6f14] sm:text-sm">
          Live
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="aspect-video rounded-xl bg-gradient-to-br from-emerald/20 to-emerald-deep/30" />
        <div className="aspect-video rounded-xl bg-gradient-to-br from-gold/15 to-emerald/15" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {["Guide", "Activity", "Progress"].map((tab) => (
          <span
            key={tab}
            className={`rounded-lg border border-emerald/15 bg-cream px-3.5 py-1.5 text-sm font-medium sm:text-[0.9375rem] ${TEXT.body}`}
          >
            {tab}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProgressMockup() {
  return (
    <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-white/95 to-cream/85 p-5 shadow-lg backdrop-blur-sm sm:p-6">
      <p
        className={`text-sm font-semibold uppercase tracking-wider sm:text-[0.9375rem] ${TEXT.label}`}
      >
        Weekly Progress
      </p>
      <div className="mt-4 space-y-3.5">
        {[
          { label: "Character", pct: 85 },
          { label: "Creativity", pct: 72 },
          { label: "Confidence", pct: 90 },
        ].map((item) => (
          <div key={item.label}>
            <div className={`mb-1.5 flex justify-between text-sm font-medium sm:text-base ${TEXT.title}`}>
              <span className="font-semibold">{item.label}</span>
              <span className="font-bold text-gold">{item.pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-emerald/12">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald to-gold"
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OnlineLearningSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      scrollReveal("[data-step-card]", {
        trigger: sectionRef.current,
        start: "top 72%",
        stagger: 0.15,
        y: 45,
      });

      scrollReveal("[data-workflow-panel]", {
        trigger: sectionRef.current,
        start: "top 75%",
        x: 40,
        y: 0,
      });

      gsap.fromTo(
        "[data-connector-line]",
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative overflow-hidden bg-gradient-to-b from-cream to-emerald-deep/[0.04] px-6 py-24 lg:px-8 lg:py-32"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,162,39,0.08),transparent_55%)]" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#0d3b2e 1px, transparent 1px), linear-gradient(90deg, #0d3b2e 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          title="How Online Learning Works"
          subtitle="A clear, guided digital journey — from first connection to consistent growth at home."
          className="[&_p]:text-base [&_p]:font-medium [&_p]:leading-relaxed [&_p]:text-[#245C4F] sm:[&_p]:text-lg"
        />

        <div className="grid items-start gap-12 lg:grid-cols-5 lg:gap-12 xl:gap-14">
          {/* Steps timeline */}
          <div className="relative space-y-7 lg:col-span-3">
            {ONLINE_STEPS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < ONLINE_STEPS.length - 1 && (
                  <div
                    data-connector-line
                    className="absolute left-8 top-[4.75rem] hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-emerald/40 via-gold/50 to-emerald/20 lg:block"
                    style={{ transformOrigin: "left center" }}
                  />
                )}

                <article
                  data-step-card
                  className="group relative flex gap-6 rounded-2xl border border-emerald/12 bg-white/80 p-6 shadow-lg shadow-emerald-deep/8 backdrop-blur-md transition-all duration-400 hover:border-gold/30 hover:shadow-xl hover:shadow-emerald/10 sm:gap-7 sm:p-7 lg:p-8"
                >
                  <div className="flex shrink-0 flex-col items-center gap-3 pt-0.5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald/18 bg-gradient-to-br from-emerald/12 to-gold/12 text-emerald transition-colors group-hover:border-gold/35 sm:h-16 sm:w-16">
                      <LearningIcon name={step.icon} className="h-7 w-7 sm:h-8 sm:w-8" />
                    </div>
                    <span className={`text-sm font-bold tracking-wide ${TEXT.label}`}>
                      {step.step}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 py-0.5">
                    <h3
                      className={`text-xl font-semibold leading-snug sm:text-[1.375rem] lg:text-[1.625rem] ${TEXT.title}`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`mt-3 text-base font-normal leading-[1.7] sm:mt-3.5 sm:text-[1.0625rem] lg:text-[1.125rem] lg:leading-[1.75] ${TEXT.body}`}
                    >
                      {step.description}
                    </p>
                  </div>
                </article>
              </div>
            ))}
          </div>

          {/* Dashboard mockups */}
          <div data-workflow-panel className="relative space-y-6 lg:col-span-2">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald/5 to-gold/5 blur-xl" />
            <div className="relative">
              <VideoCallMockup />
            </div>
            <div className="relative">
              <ProgressMockup />
            </div>
            <div className="relative rounded-2xl border border-emerald/12 bg-emerald-deep/[0.06] px-5 py-5 text-center sm:px-6 sm:py-6">
              <p
                className={`text-sm font-semibold uppercase tracking-widest sm:text-[0.9375rem] ${TEXT.label}`}
              >
                Digital Learning Ecosystem
              </p>
              <p
                className={`mt-3 text-base font-medium leading-relaxed sm:text-[1.0625rem] lg:text-lg lg:leading-[1.65] ${TEXT.body}`}
              >
                Guided sessions • Home practice • Parent updates
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
