"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { BilingualSectionHeader } from "@/components/ui/BilingualLayout";

type ProgramCard = {
  titleEn: string;
  titleUr: string;
  descEn: string;
  descUr: string;
};

const PROGRAMS: ProgramCard[] = [
  {
    titleEn: "Play Group",
    titleUr: "پلے گروپ",
    descEn: "A gentle online start for young learners through guided activities, early language, basic numeracy, confidence building, and joyful learning routines.",
    descUr: "ننھے بچوں کے لیے ایک نرم اور بامقصد آن لائن آغاز، جس میں رہنمائی پر مبنی سرگرمیاں، ابتدائی زبان، بنیادی ریاضی، اعتماد اور خوشگوار سیکھنے کی عادات شامل ہیں۔",
  },
  {
    titleEn: "Prep-I",
    titleUr: "پری پہلی",
    descEn: "A structured early learning level focused on literacy readiness, numeracy foundations, Islamic values, creativity, communication, and positive habits.",
    descUr: "ابتدائی تعلیم کا ایک منظم مرحلہ جس میں زبان و خواندگی کی تیاری، بنیادی ریاضی، اسلامی اقدار، تخلیقی صلاحیت، اظہار اور مثبت عادات پر توجہ دی جاتی ہے۔",
  },
  {
    titleEn: "Prep-II",
    titleUr: "پری دوئم",
    descEn: "A stronger preparation level for confident early learners, developing reading readiness, number sense, communication skills, character, discipline, and independent learning habits.",
    descUr: "اعتماد کے ساتھ آگے بڑھنے والے بچوں کے لیے تیاری کا مضبوط مرحلہ، جس میں پڑھنے کی تیاری، عددی سمجھ، گفتگو کی مہارت، کردار، نظم و ضبط اور خود سیکھنے کی عادات کو فروغ دیا جاتا ہے۔",
  },
  {
    titleEn: "Parent Partnership",
    titleUr: "والدین کی شراکت",
    descEn: "Parents are guided as active learning partners through home-based support, progress communication, healthy routines, balanced screen use, and child-development guidance.",
    descUr: "والدین کو گھر پر معاونت، پیش رفت کی رہنمائی، صحت مند معمولات، اسکرین کے متوازن استعمال اور بچے کی نشوونما سے متعلق رہنمائی کے ذریعے فعال تعلیمی شریک بنایا جاتا ہے۔",
  },
];

export function ProgramsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !gridRef.current) return;

      const cards = gridRef.current.querySelectorAll("[data-program-card]");
      scrollReveal(cards, {
        trigger: gridRef.current,
        start: "top 72%",
        stagger: 0.08,
        y: 40,
      });

      scrollReveal("[data-programs-cta]", {
        trigger: gridRef.current,
        start: "bottom 90%",
        y: 20,
      });
    },
    { scope: sectionRef }
  );

  const handleEnter = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      y: -6,
      scale: 1.015,
      duration: 0.35,
      ease: "power2.out",
    });
  };

  const handleLeave = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      duration: 0.35,
      ease: "power2.out",
    });
  };

  return (
    <section
      ref={sectionRef}
      id="programs"
      className="relative overflow-hidden bg-gradient-to-b from-cream via-white to-cream px-6 py-24 lg:px-8 lg:py-32"
    >
      {/* Background soft light shapes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(201,162,39,0.04),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(26,92,69,0.03),transparent_60%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <BilingualSectionHeader
          urduTitle="پروگرامز"
          urduSubtitle="والدین کی شراکت کے ساتھ منظم آن لائن ابتدائی تعلیم۔"
          englishTitle="Programs"
          englishSubtitle="Structured online early-years learning with parent partnership."
          badge="Our Programs"
          centered
        />

        {/* 2x2 grid on desktop, 2 columns on tablet, 1 column on mobile */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8"
        >
          {PROGRAMS.map((program) => (
            <article
              key={program.titleEn}
              data-program-card
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
              className="group relative overflow-hidden rounded-3xl border border-emerald/10 bg-white/70 p-6 shadow-md transition-all duration-300 hover:border-gold/30 hover:bg-white hover:shadow-xl hover:shadow-emerald/5 md:p-8"
            >
              {/* Gold/Green accent indicator */}
              <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-gold to-emerald opacity-80 group-hover:opacity-100" />

              {/* Bilingual card header */}
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 border-b border-emerald/5 pb-3">
                <h3 className="font-display text-xl font-bold text-emerald-deep sm:text-2xl">
                  {program.titleEn}
                </h3>
                <span dir="rtl" lang="ur" className="font-urdu text-lg font-bold text-gold">
                  {program.titleUr}
                </span>
              </div>

              {/* Swapped layout text blocks: English Left, Urdu Right */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* English Description */}
                <div dir="ltr" lang="en">
                  <p className="text-sm leading-relaxed text-emerald-deep/75">
                    {program.descEn}
                  </p>
                </div>

                {/* Urdu Description */}
                <div dir="rtl" lang="ur" className="text-right">
                  <p className="font-urdu text-sm leading-[2] text-emerald-deep/80">
                    {program.descUr}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Enroll Button below the cards */}
        <div data-programs-cta className="mt-16 flex justify-center">
          <a
            href="/register"
            className="rounded-full bg-emerald px-8 py-3.5 text-sm font-semibold tracking-wide text-cream shadow-lg shadow-emerald/20 transition-all duration-300 hover:bg-emerald-light hover:shadow-emerald/35 hover:scale-105 active:scale-95"
          >
            Enroll in a Program / رجسٹریشن کروائیں
          </a>
        </div>
      </div>
    </section>
  );
}
