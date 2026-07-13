"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ValueCard } from "@/components/values/ValueCard";
import { useLanguage } from "@/contexts/LanguageContext";

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
      className={`values-carousel-arrow group absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-emerald/20 bg-white/95 text-emerald-deep shadow-[0_8px_28px_rgba(13,59,46,0.14)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-gold/50 hover:bg-white hover:text-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 sm:h-14 sm:w-14 ${
        direction === "prev"
          ? "left-2 translate-x-0 sm:left-3 lg:left-0 lg:-translate-x-1/2 xl:-left-2"
          : "right-2 translate-x-0 sm:right-3 lg:right-0 lg:translate-x-1/2 xl:-right-2"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-6 w-6 transition-transform duration-300 group-hover:scale-110 ${
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
  const { t, language } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      dragFree: false,
      duration: 38,
      skipSnaps: false,
    },
    [Autoplay({ delay: 3800, stopOnInteraction: true, stopOnMouseEnter: true })]
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
      className="values-carousel relative mx-auto w-full max-w-[1400px]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Our core values"
      dir="ltr"
    >
      {/* Radial spotlight behind track */}
      <div
        className="pointer-events-none absolute inset-x-[5%] top-1/2 h-[420px] -translate-y-1/2 rounded-[3rem] bg-[radial-gradient(ellipse_at_center,rgba(45,138,106,0.1),rgba(201,162,39,0.06)_45%,transparent_72%)] blur-sm"
        aria-hidden
      />

      <div className="relative px-12 sm:px-14 md:px-16 lg:px-20 xl:px-24">
        <CarouselArrow direction="prev" onClick={scrollPrev} disabled={!canScrollPrev} />
        <CarouselArrow direction="next" onClick={scrollNext} disabled={!canScrollNext} />

        <div
          ref={emblaRef}
          className="values-carousel-viewport min-h-[280px] overflow-hidden outline-none sm:min-h-[300px] lg:min-h-[340px]"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div className="flex touch-pan-y py-3 sm:py-4">
            {t.values.items.map((value: { title: string; description: string; }, index: number) => (
              <div
                key={value.title}
                className="values-carousel-slide min-w-0 flex-[0_0_88%] px-2 sm:flex-[0_0_min(85%,340px)] md:flex-[0_0_320px] lg:flex-[0_0_380px] xl:flex-[0_0_400px]"
              >
                <ValueCard
                  title={value.title}
                  description={value.description}
                  index={index}
                  isActive={index === selectedIndex}
                  language={language}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="mt-10 flex flex-wrap items-center justify-center gap-2.5 sm:mt-12"
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
            className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
              index === selectedIndex
                ? "w-10 bg-gradient-to-r from-emerald-light via-gold to-gold-soft shadow-[0_0_14px_rgba(201,162,39,0.35)]"
                : "w-2.5 bg-emerald/30 hover:w-3.5 hover:bg-emerald/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
