"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import type { WorkItem } from "@/data/works";

type Breakpoint = "mobile" | "tablet" | "desktop";

function ChevronLeft({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getRelativeIndex(index: number, activeIndex: number, total: number) {
  let diff = index - activeIndex;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}

function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>("mobile");

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 768) setBp("mobile");
      else if (w < 1024) setBp("tablet");
      else setBp("desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return bp;
}

function getGlobeCardStyle(
  relativeIndex: number,
  breakpoint: Breakpoint
): CSSProperties {
  const configs = {
    mobile: {
      sideX: 135,
      backX: 220,
      sideY: 34,
      backY: 70,
      sideRotate: 14,
      backRotate: 22,
      sideScale: 0.72,
      backScale: 0.5,
      sideOpacity: 0.32,
      backOpacity: 0,
    },
    tablet: {
      sideX: 240,
      backX: 390,
      sideY: 42,
      backY: 90,
      sideRotate: 24,
      backRotate: 36,
      sideScale: 0.78,
      backScale: 0.6,
      sideOpacity: 0.5,
      backOpacity: 0.15,
    },
    desktop: {
      sideX: 330,
      backX: 560,
      sideY: 45,
      backY: 105,
      sideRotate: 32,
      backRotate: 48,
      sideScale: 0.86,
      backScale: 0.68,
      sideOpacity: 0.78,
      backOpacity: 0.32,
    },
  } as const;

  const c = configs[breakpoint];

  switch (relativeIndex) {
    case 0:
      return {
        transform: "translateX(-50%) translateY(0px) rotateY(0deg) scale(1)",
        opacity: 1,
        zIndex: 50,
        filter: "blur(0px)",
        pointerEvents: "auto",
      };
    case -1:
      return {
        transform: `translateX(calc(-50% - ${c.sideX}px)) translateY(${c.sideY}px) rotateY(${c.sideRotate}deg) scale(${c.sideScale})`,
        opacity: c.sideOpacity,
        zIndex: 35,
        filter: "blur(0.5px)",
        pointerEvents: breakpoint === "mobile" ? "none" : "auto",
      };
    case 1:
      return {
        transform: `translateX(calc(-50% + ${c.sideX}px)) translateY(${c.sideY}px) rotateY(-${c.sideRotate}deg) scale(${c.sideScale})`,
        opacity: c.sideOpacity,
        zIndex: 35,
        filter: "blur(0.5px)",
        pointerEvents: breakpoint === "mobile" ? "none" : "auto",
      };
    case -2:
      return {
        transform: `translateX(calc(-50% - ${c.backX}px)) translateY(${c.backY}px) rotateY(${c.backRotate}deg) scale(${c.backScale})`,
        opacity: c.backOpacity,
        zIndex: 25,
        filter: c.backOpacity > 0 ? "blur(1px)" : "blur(2px)",
        pointerEvents: "none",
      };
    case 2:
      return {
        transform: `translateX(calc(-50% + ${c.backX}px)) translateY(${c.backY}px) rotateY(-${c.backRotate}deg) scale(${c.backScale})`,
        opacity: c.backOpacity,
        zIndex: 25,
        filter: c.backOpacity > 0 ? "blur(1px)" : "blur(2px)",
        pointerEvents: "none",
      };
    default:
      return {
        transform: "translateX(-50%) translateY(160px) scale(0.5)",
        opacity: 0,
        zIndex: 0,
        filter: "blur(3px)",
        pointerEvents: "none",
      };
  }
}

function WorkCard({
  item,
  language,
  readMoreLabel,
  onReadMore,
}: {
  item: WorkItem;
  language: "en" | "ur";
  readMoreLabel: string;
  onReadMore: (item: WorkItem) => void;
}) {
  const isUrdu = language === "ur";
  const imageFitClass =
    item.fit === "contain"
      ? "object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"
      : "object-cover transition-transform duration-500 group-hover:scale-[1.03]";

  return (
    <article
      dir={isUrdu ? "rtl" : "ltr"}
      lang={isUrdu ? "ur" : "en"}
      className={`group flex h-full flex-col overflow-hidden rounded-3xl border border-emerald/12 bg-white shadow-[0_20px_50px_rgba(13,59,46,0.12)] transition-all duration-500 hover:border-gold/35 hover:shadow-[0_28px_60px_rgba(13,59,46,0.16)] ${
        isUrdu ? "text-right font-urdu" : "text-left"
      }`}
    >
      <div className="relative h-56 w-full overflow-hidden rounded-t-3xl bg-[#fff8ea] sm:h-64 lg:h-[360px]">
        <Image
          src={item.image}
          alt={item.alt[language]}
          fill
          sizes="(max-width: 768px) 82vw, 460px"
          className={imageFitClass}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-deep/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <span className="inline-flex w-fit rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-deep">
          {item.category[language]}
        </span>
        <h3
          className={`mt-3 line-clamp-2 text-xl font-bold leading-snug text-emerald-deep sm:text-2xl ${
            isUrdu ? "leading-[1.8]" : "font-display"
          }`}
        >
          {item.title[language]}
        </h3>
        <p
          className={`mt-3 line-clamp-3 flex-1 text-sm leading-7 text-emerald-deep/75 sm:text-base ${
            isUrdu ? "leading-[2]" : ""
          }`}
        >
          {item.description[language]}
        </p>
        <button
          type="button"
          onClick={() => onReadMore(item)}
          className={`mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-emerald px-5 py-3 text-sm font-semibold text-cream transition-all duration-300 hover:bg-emerald-light sm:w-auto ${
            isUrdu ? "sm:self-end" : "sm:self-start"
          }`}
        >
          {readMoreLabel}
        </button>
      </div>
    </article>
  );
}

export function WorksGlobeCarousel({
  works,
  language,
  readMoreLabel,
  onReadMore,
}: {
  works: WorkItem[];
  language: "en" | "ur";
  readMoreLabel: string;
  onReadMore: (item: WorkItem) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const breakpoint = useBreakpoint();
  const total = works.length;

  const goNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setActiveIndex((current) => (current - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total < 2) return;
    const id = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, 4800);
    return () => window.clearInterval(id);
  }, [total]);

  if (total === 0) return null;

  return (
    <div className="relative mt-10 w-full max-w-full overflow-x-hidden" dir="ltr">
      <div className="relative mx-auto h-[620px] w-full max-w-full overflow-hidden [perspective:1400px] sm:h-[680px] sm:[perspective:1800px] lg:h-[760px]">
        <div
          className="pointer-events-none absolute left-1/2 top-[58%] h-[100px] w-[min(70%,640px)] -translate-x-1/2 rounded-[100%] bg-emerald-deep/10 blur-2xl"
          aria-hidden
        />

        {works.map((item, index) => {
          const relative = getRelativeIndex(index, activeIndex, total);
          const style = getGlobeCardStyle(relative, breakpoint);
          const isVisible = Math.abs(relative) <= 2;

          return (
            <div
              key={item.id}
              className="absolute left-1/2 top-0 w-[82vw] max-w-[330px] transform-gpu transition-all duration-700 ease-in-out will-change-transform [transform-style:preserve-3d] sm:w-[360px] sm:max-w-none md:w-[380px] lg:w-[460px]"
              style={style}
              aria-hidden={!isVisible || relative !== 0}
            >
              <WorkCard
                item={item}
                language={language}
                readMoreLabel={readMoreLabel}
                onReadMore={onReadMore}
              />
            </div>
          );
        })}

        <button
          type="button"
          onClick={goPrev}
          aria-label={language === "ur" ? "پچھلا کام" : "Previous work"}
          className="absolute left-3 top-[42%] z-[70] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-deep/15 bg-white/95 text-emerald-deep shadow-xl transition hover:bg-emerald-deep hover:text-cream sm:left-4 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
        >
          <ChevronLeft />
        </button>

        <button
          type="button"
          onClick={goNext}
          aria-label={language === "ur" ? "اگلا کام" : "Next work"}
          className="absolute right-3 top-[42%] z-[70] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-deep/15 bg-white/95 text-emerald-deep shadow-xl transition hover:bg-emerald-deep hover:text-cream sm:right-4 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="mt-6 flex max-w-full flex-wrap justify-center gap-2 overflow-hidden px-4 sm:px-6">
        {works.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={language === "ur" ? `کام ${index + 1}` : `Go to work ${index + 1}`}
            aria-current={index === activeIndex ? "true" : undefined}
            className={`h-2 rounded-full transition-all ${
              index === activeIndex
                ? "w-7 bg-gradient-to-r from-[#d4af37] to-[#064635]"
                : "w-2 bg-emerald-deep/25 hover:bg-emerald-deep/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
