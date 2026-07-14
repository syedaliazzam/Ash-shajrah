"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { useLanguage } from "@/contexts/LanguageContext";
import { WORK_ITEMS, type WorkItem } from "@/data/works";
import { WorksGlobeCarousel } from "@/components/sections/WorksGlobeCarousel";

function WorkDetailModal({
  item,
  language,
  onClose,
  closeLabel,
}: {
  item: WorkItem;
  language: "en" | "ur";
  onClose: () => void;
  closeLabel: string;
}) {
  const isUrdu = language === "ur";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-emerald-deep/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="work-modal-title"
        dir={isUrdu ? "rtl" : "ltr"}
        lang={isUrdu ? "ur" : "en"}
        className={`relative flex max-h-[min(85vh,100dvh)] w-[92vw] max-w-3xl flex-col overflow-hidden rounded-2xl bg-cream shadow-2xl ${
          isUrdu ? "text-right font-urdu" : "text-left"
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-emerald/10 bg-white/60 px-4 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-deep">
              {item.category[language]}
            </span>
            <h2
              id="work-modal-title"
              className={`mt-2 text-lg font-bold text-emerald-deep sm:text-2xl ${
                isUrdu ? "leading-[1.7]" : "font-display"
              }`}
            >
              {item.title[language]}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald/10 text-emerald-deep transition-colors hover:bg-emerald/20"
            aria-label={closeLabel}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <div className="relative mx-auto h-[min(52vh,420px)] w-full overflow-hidden rounded-2xl bg-[#fff8ea]">
            <Image
              src={item.image}
              alt={item.alt[language]}
              fill
              sizes="(max-width: 768px) 90vw, 720px"
              className="object-contain p-3"
              priority
            />
          </div>
          <p
            className={`mt-5 text-emerald-deep/85 sm:text-lg ${
              isUrdu ? "leading-[2.1]" : "leading-relaxed"
            }`}
          >
            {item.details[language]}
          </p>
        </div>

        <div className="border-t border-emerald/10 bg-white/40 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-emerald/20 bg-emerald px-6 py-2.5 text-sm font-semibold text-cream transition hover:bg-emerald-light"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function OurWorksSection() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const isUrdu = language === "ur";
  const [selected, setSelected] = useState<WorkItem | null>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      scrollReveal("[data-works-header]", {
        trigger: sectionRef.current,
        start: "top 82%",
        y: 24,
      });

      scrollReveal("[data-works-carousel]", {
        trigger: sectionRef.current,
        start: "top 75%",
        y: 40,
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="works"
      className="relative overflow-hidden bg-cream px-0 py-16 sm:px-4 sm:py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cream via-cream-dark/15 to-cream" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(201,162,39,0.1),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(45,138,106,0.06),transparent_50%)]" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          data-works-header
          className={`mx-auto max-w-3xl text-center ${isUrdu ? "font-urdu" : ""}`}
        >
          <h2
            className={`mb-4 text-3xl font-bold text-emerald-deep sm:text-4xl ${
              isUrdu ? "leading-[1.8]" : "font-display"
            }`}
          >
            {t.works.title}
          </h2>
          <p
            className={`text-emerald-deep/80 sm:text-lg ${
              isUrdu ? "leading-[2.2]" : "leading-relaxed"
            }`}
          >
            {t.works.description}
          </p>
        </div>

        <div data-works-carousel className="pb-4 sm:pb-2">
          <WorksGlobeCarousel
            works={WORK_ITEMS}
            language={language}
            readMoreLabel={t.works.readMore}
            onReadMore={setSelected}
          />
        </div>
      </div>

      {selected && (
        <WorkDetailModal
          item={selected}
          language={language}
          onClose={() => setSelected(null)}
          closeLabel={t.works.close}
        />
      )}
    </section>
  );
}
