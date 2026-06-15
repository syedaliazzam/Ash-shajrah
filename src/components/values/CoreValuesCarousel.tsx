"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { VALUES } from "@/lib/data";

const LEAF_VARIANTS = [
  "M12 2C8 8 4 14 4 22c0 6 3.5 10 8 12 4.5-2 8-6 8-12 0-8-4-14-8-20z",
  "M12 3C9 9 5 15 5 22c0 5 2.5 9 7 11 4.5-2 7-6 7-11 0-7-3.5-13-7-19z",
  "M12 1C7 8 3 15 3 23c0 7 4 11 9 13 5-2 9-6 9-13 0-8-4-15-9-22z",
];

function ValueLeafIcon({ index }: { index: number }) {
  const path = LEAF_VARIANTS[index % LEAF_VARIANTS.length];
  const hue = index % 2 === 0 ? "text-emerald" : "text-gold";

  return (
    <div
      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald/15 bg-gradient-to-br from-white/90 to-cream/80 shadow-inner ${hue}`}
      aria-hidden
    >
      <svg viewBox="0 0 24 36" className="h-7 w-5" fill="currentColor">
        <path d={path} />
      </svg>
      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-gold/70" />
    </div>
  );
}

function ValueCard({
  title,
  description,
  index,
  isActive,
}: {
  title: string;
  description: string;
  index: number;
  isActive: boolean;
}) {
  return (
    <article
      className={`group relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-2xl border bg-white/75 p-6 shadow-lg backdrop-blur-md transition-all duration-500 ease-out ${
        isActive
          ? "scale-[1.03] border-gold/50 shadow-2xl shadow-emerald-deep/15 ring-1 ring-gold/30"
          : "scale-100 border-emerald/15 shadow-emerald-deep/8 hover:-translate-y-1.5 hover:border-emerald/35 hover:shadow-xl hover:shadow-emerald-deep/12 hover:ring-1 hover:ring-emerald/20"
      }`}
    >
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity duration-500 ${
          isActive ? "bg-gold/25 opacity-100" : "bg-emerald/10 opacity-60 group-hover:opacity-90"
        }`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-gold via-gold-soft to-emerald-light transition-transform duration-500 group-hover:scale-x-100"
        aria-hidden
      />
      {isActive && (
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-gold via-gold-soft to-emerald-light"
          aria-hidden
        />
      )}

      <div className="relative flex items-start gap-4">
        <ValueLeafIcon index={index} />
        <div className="min-w-0 flex-1 pt-0.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald/45">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="font-display text-xl font-semibold text-emerald-deep">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-emerald/80">{description}</p>
        </div>
      </div>
    </article>
  );
}

function CarouselArrow({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  const label = direction === "prev" ? "Previous value" : "Next value";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald/20 bg-white/85 text-emerald-deep shadow-md shadow-emerald-deep/10 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-gold/50 hover:bg-white hover:text-gold hover:shadow-lg hover:shadow-gold/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
          direction === "prev" ? "rotate-180" : ""
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}

export function CoreValuesCarousel() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: false, duration: 28 },
    [Autoplay({ delay: 3500, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  return (
    <div
      className="relative mx-auto max-w-7xl"
      role="region"
      aria-roledescription="carousel"
      aria-label="Our core values"
    >
      <div className="flex items-center gap-3 md:gap-4">
        <CarouselArrow direction="prev" onClick={scrollPrev} disabled={!canScrollPrev} />

        <div
          ref={emblaRef}
          className="min-h-[220px] flex-1 overflow-hidden outline-none"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div className="flex touch-pan-y">
            {VALUES.map((value, index) => (
              <div
                key={value.title}
                className="min-w-0 flex-[0_0_100%] pl-3 md:flex-[0_0_50%] md:pl-4 lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]"
              >
                <ValueCard
                  title={value.title}
                  description={value.description}
                  index={index}
                  isActive={index === selectedIndex}
                />
              </div>
            ))}
          </div>
        </div>

        <CarouselArrow direction="next" onClick={scrollNext} disabled={!canScrollNext} />
      </div>

      <div
        className="mt-8 flex flex-wrap items-center justify-center gap-2"
        role="tablist"
        aria-label="Carousel pagination"
      >
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === selectedIndex}
            aria-label={`Go to value ${index + 1}`}
            onClick={() => scrollTo(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "w-8 bg-gradient-to-r from-gold to-emerald-light shadow-sm shadow-gold/30"
                : "w-2.5 bg-emerald/25 hover:bg-emerald/45"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
