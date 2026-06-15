"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LearningIcon } from "@/components/ui/LearningIcon";
import { ONLINE_STEPS } from "@/lib/data";

function VideoCallMockup() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald/15 bg-white/80 p-4 shadow-2xl shadow-emerald-deep/10 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-light" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald">
            Online Session
          </span>
        </div>
        <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-gold">
          Live
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="aspect-video rounded-xl bg-gradient-to-br from-emerald/20 to-emerald-deep/30" />
        <div className="aspect-video rounded-xl bg-gradient-to-br from-gold/15 to-emerald/15" />
      </div>
      <div className="mt-3 flex gap-2">
        {["Guide", "Activity", "Progress"].map((tab) => (
          <span
            key={tab}
            className="rounded-lg border border-emerald/10 bg-cream px-2.5 py-1 text-[10px] font-medium text-emerald/70"
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
    <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-white/90 to-cream/80 p-4 shadow-lg backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald/60">
        Weekly Progress
      </p>
      <div className="mt-3 space-y-2">
        {[
          { label: "Character", pct: 85 },
          { label: "Creativity", pct: 72 },
          { label: "Confidence", pct: 90 },
        ].map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-[11px] text-emerald-deep">
              <span>{item.label}</span>
              <span className="text-gold">{item.pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-emerald/10">
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
        />

        <div className="grid items-start gap-12 lg:grid-cols-5 lg:gap-10">
          {/* Steps timeline */}
          <div className="relative space-y-6 lg:col-span-3">
            {ONLINE_STEPS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < ONLINE_STEPS.length - 1 && (
                  <div
                    data-connector-line
                    className="absolute left-6 top-16 hidden h-px w-[calc(100%-3rem)] bg-gradient-to-r from-emerald/40 via-gold/50 to-emerald/20 lg:block"
                    style={{ transformOrigin: "left center" }}
                  />
                )}

                <article
                  data-step-card
                  className="group relative flex gap-5 rounded-2xl border border-emerald/10 bg-white/75 p-5 shadow-lg shadow-emerald-deep/5 backdrop-blur-md transition-all duration-400 hover:border-gold/30 hover:shadow-xl hover:shadow-emerald/10 sm:p-6"
                >
                  <div className="flex shrink-0 flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald/15 bg-gradient-to-br from-emerald/10 to-gold/10 text-emerald transition-colors group-hover:border-gold/35">
                      <LearningIcon name={step.icon} className="h-5 w-5" />
                    </div>
                    <span className="font-display text-xs font-bold text-gold">{step.step}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-emerald-deep">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-emerald/80">
                      {step.description}
                    </p>
                  </div>
                </article>
              </div>
            ))}
          </div>

          {/* Dashboard mockups */}
          <div data-workflow-panel className="relative space-y-5 lg:col-span-2">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald/5 to-gold/5 blur-xl" />
            <div className="relative">
              <VideoCallMockup />
            </div>
            <div className="relative">
              <ProgressMockup />
            </div>
            <div className="relative rounded-2xl border border-emerald/10 bg-emerald-deep/5 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald/60">
                Digital Learning Ecosystem
              </p>
              <p className="mt-2 font-display text-sm text-emerald-deep">
                Guided sessions • Home practice • Parent updates
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
