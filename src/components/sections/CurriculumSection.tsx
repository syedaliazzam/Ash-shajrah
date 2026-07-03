"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";

const CURRICULUM_AREAS = [
  { english: "Language", urdu: "زبان" },
  { english: "Numeracy", urdu: "ریاضی کی بنیادی مہارتیں" },
  { english: "Fehm-e-Deen", urdu: "فہمِ دین" },
  { english: "Islamic Values", urdu: "اسلامی اقدار" },
  { english: "Creativity", urdu: "تخلیقی صلاحیت" },
  { english: "Critical Thinking", urdu: "تنقیدی سوچ" },
  { english: "Personal Development", urdu: "شخصی نشوونما" },
  { english: "Parent-Supported Home Learning", urdu: "والدین کی معاونت سے گھر پر سیکھنا" },
];

function CurriculumCard({
  englishTitle,
  urduTitle,
  index,
}: {
  englishTitle: string;
  urduTitle: string;
  index: number;
}) {
  const cardRef = useRef<HTMLElement>(null);

  const handleEnter = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, { y: -8, scale: 1.02, duration: 0.4, ease: "power2.out" });
  };

  const handleLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, { y: 0, scale: 1, duration: 0.4, ease: "power2.out" });
  };

  return (
    <article
      ref={cardRef}
      data-curriculum-card
      className="group relative overflow-hidden rounded-2xl p-[1px]"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald/30 via-gold/20 to-emerald/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col justify-center rounded-2xl border border-emerald/10 bg-white/70 p-6 shadow-lg shadow-emerald-deep/5 backdrop-blur-md transition-all duration-500 group-hover:border-gold/35 group-hover:bg-white/85 group-hover:shadow-xl group-hover:shadow-emerald/10">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold/10 blur-2xl transition-all group-hover:bg-gold/20" />

        <div className="mb-4 flex items-center justify-between">
          <span className="font-display text-lg font-semibold text-gold/60">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="h-px flex-1 mx-4 bg-gradient-to-r from-emerald/10 via-gold/20 to-emerald/10" />
        </div>

        <div className="grid grid-cols-2 gap-4 items-center h-full">
          {/* English Left */}
          <div dir="ltr" lang="en" className="text-left h-full flex items-center justify-start border-r border-emerald/10 pr-4">
            <h3 className="font-display text-base sm:text-lg font-semibold leading-snug text-emerald-deep">
              {englishTitle}
            </h3>
          </div>
          {/* Urdu Right */}
          <div dir="rtl" lang="ur" className="text-right h-full flex items-center justify-end">
            <h3 className="font-urdu text-lg sm:text-xl font-bold leading-[1.7] text-emerald-deep">
              {urduTitle}
            </h3>
          </div>
        </div>
      </div>
    </article>
  );
}

export function CurriculumSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      scrollReveal("[data-curriculum-card]", {
        trigger: sectionRef.current,
        start: "top 75%",
        stagger: 0.1,
        y: 40,
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="curriculum"
      className="relative overflow-hidden bg-gradient-to-b from-white via-cream/30 to-emerald/[0.02] px-6 py-24 lg:px-8 lg:py-32"
    >
      <div className="relative mx-auto max-w-7xl">
        {/* Custom Header with Urdu on Left, English on Right as requested */}
        <div className="mb-12 sm:mb-16 text-center">
          <span className="mb-5 inline-block rounded-full border border-emerald/20 bg-emerald/8 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald">
            Curriculum
          </span>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10 items-start text-left">
            {/* LEFT — English */}
            <div dir="ltr" lang="en" className="text-left">
              <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-[2.6rem] text-emerald-deep">
                Curriculum Framework
              </h2>
              <p className="mt-3 text-base leading-relaxed sm:text-lg text-emerald/70">
                Our curriculum is built around language, numeracy, Fehm-e-Deen, Islamic values, creativity, critical thinking, personal development, and parent-supported home learning. It is designed to support early childhood growth through guided online sessions and meaningful learning activities at home.
              </p>
            </div>

            {/* RIGHT — Urdu */}
            <div dir="rtl" lang="ur" className="font-urdu text-right">
              <h2 className="font-urdu text-3xl font-bold leading-[1.7] sm:text-4xl lg:text-[2.6rem] text-emerald-deep">
                نصاب کا خاکہ
              </h2>
              <p className="mt-3 text-base leading-[2] sm:text-lg sm:leading-[2.1] text-emerald/70">
                ہمارا نصاب زبان، ریاضی کی بنیادی مہارتوں، فہمِ دین، اسلامی اقدار، تخلیقی صلاحیت، تنقیدی سوچ، شخصی نشوونما اور والدین کی معاونت سے گھر پر سیکھنے کے عمل پر مبنی ہے۔ یہ نصاب ابتدائی بچپن کی نشوونما کے لیے رہنمائی پر مبنی آن لائن سیشنز اور گھر پر بامقصد تعلیمی سرگرمیوں کے ذریعے ترتیب دیا گیا ہے۔
              </p>
            </div>
          </div>

          <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-emerald/20 to-transparent" />
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CURRICULUM_AREAS.map((area, i) => (
            <CurriculumCard
              key={area.english}
              englishTitle={area.english}
              urduTitle={area.urdu}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
