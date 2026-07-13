"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { useLanguage } from "@/contexts/LanguageContext";

type LeaderItem = {
  name: string;
  title: string;
  bio: string;
  fullBio?: string;
  image?: string;
  mirrorImage?: boolean;
  focus: string[];
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}

function LeaderPortrait({
  leader,
  language,
}: {
  leader: LeaderItem;
  language: string;
}) {
  const alt =
    language === "ur"
      ? `${leader.name}، ${leader.title} الشجرہ لرننگ ہب`
      : `${leader.name}, ${leader.title} of Ash-Shajrah Learning Hub`;

  if (leader.image) {
    return (
      <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-3xl shadow-2xl shadow-emerald-deep/20 ring-2 ring-gold/30 sm:h-44 sm:w-44 lg:h-52 lg:w-52">
        <Image
          src={leader.image}
          alt={alt}
          width={360}
          height={360}
          className={`h-full w-full object-cover object-[center_30%] ${
            leader.mirrorImage ? "-scale-x-[1.1] scale-y-[1.1]" : "scale-110"
          }`}
        />
      </div>
    );
  }

  return (
    <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald to-emerald-deep font-display text-2xl font-bold text-cream shadow-lg shadow-emerald/30 ring-2 ring-gold/20 sm:h-44 sm:w-44 lg:h-52 lg:w-52">
      {getInitials(leader.name)}
    </div>
  );
}

function LeaderCard({
  leader,
  language,
  viewMoreLabel,
  showLessLabel,
}: {
  leader: LeaderItem;
  language: string;
  viewMoreLabel: string;
  showLessLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const isUrdu = language === "ur";
  const hasFullBio = Boolean(leader.fullBio && leader.fullBio !== leader.bio);

  return (
    <article
      data-leader-card
      dir={isUrdu ? "rtl" : "ltr"}
      className={`group relative overflow-hidden rounded-3xl border border-gold/25 bg-white p-8 shadow-xl shadow-emerald-deep/5 transition-shadow hover:shadow-2xl hover:shadow-emerald/10 md:p-10 ${
        isUrdu ? "text-right font-urdu" : "text-left"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold via-emerald-light to-gold" />
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/5 blur-2xl transition-all group-hover:bg-gold/10" />

      <div
        className={`mb-6 flex flex-col items-center gap-5 sm:flex-row sm:items-start ${
          isUrdu ? "sm:flex-row-reverse" : ""
        }`}
      >
        <LeaderPortrait leader={leader} language={language} />

        <div className={`flex min-w-0 flex-1 flex-col gap-1 text-center sm:text-start ${isUrdu ? "sm:text-right" : "font-display sm:text-left"}`}>
          <h3
            className={`${
              isUrdu ? "text-xl font-bold leading-[1.8]" : "text-2xl font-semibold"
            } text-emerald-deep`}
          >
            {leader.name}
          </h3>
          <p
            className={`${
              isUrdu
                ? "text-sm font-semibold leading-[1.8]"
                : "text-sm font-semibold uppercase tracking-wider"
            } text-gold`}
          >
            {leader.title}
          </p>
        </div>
      </div>

      <p
        className={`text-emerald/80 ${
          isUrdu ? "text-sm leading-[2.1] sm:text-[0.9rem]" : "text-sm leading-relaxed md:text-base"
        }`}
      >
        {leader.bio}
      </p>

      {hasFullBio && (
        <>
          <div
            id={panelId}
            className="grid transition-[grid-template-rows] duration-500 ease-in-out motion-reduce:transition-none"
            style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
            aria-hidden={!expanded}
          >
            <div className="overflow-hidden">
              <p
                className={`pt-3 text-emerald/75 ${
                  isUrdu
                    ? "text-sm leading-[2.1] sm:text-[0.9rem]"
                    : "text-sm leading-relaxed md:text-base"
                }`}
              >
                {leader.fullBio}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-controls={panelId}
            className={`mt-4 text-sm font-semibold text-gold transition-colors hover:text-emerald ${
              isUrdu ? "font-urdu" : ""
            }`}
          >
            {expanded ? showLessLabel : viewMoreLabel}
          </button>
        </>
      )}

      <div className={`mt-6 flex flex-wrap gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
        {leader.focus.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-emerald/15 bg-emerald/5 px-3 py-1 text-[11px] font-semibold text-emerald-deep"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

export function LeadershipSection() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      scrollReveal("[data-leader-card]", {
        trigger: sectionRef.current,
        start: "top 75%",
        stagger: 0.2,
        y: 50,
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="leadership"
      className="relative overflow-hidden bg-gradient-to-b from-cream to-emerald-deep/5 px-6 py-24 lg:px-8 lg:py-32"
    >
      <div className="relative mx-auto max-w-7xl">
        <div className={`mb-16 text-center ${language === "ur" ? "font-urdu" : ""}`}>
          <span className="mb-4 inline-block rounded-full border border-emerald/20 bg-emerald/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald">
            {t.nav.leadership}
          </span>
          <h2
            className={`mb-4 text-3xl font-bold text-emerald-deep sm:text-4xl ${
              language === "ur" ? "leading-[1.8]" : "font-display"
            }`}
          >
            {t.leadership.title}
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {t.leadership.items.map((leader: LeaderItem) => (
            <LeaderCard
              key={leader.name}
              leader={leader}
              language={language}
              viewMoreLabel={t.leadership.viewMore}
              showLessLabel={t.leadership.showLess}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
