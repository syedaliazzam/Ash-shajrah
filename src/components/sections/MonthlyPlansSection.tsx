"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import type { MonthlyPlansData } from "@/lib/monthly-plans";

function PlayIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function ChevronLeft({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden
    >
      <path
        d="M15 18l-6-6 6-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden
    >
      <path
        d="M9 18l6-6-6-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  initialData?: MonthlyPlansData | null;
};

export function MonthlyPlansSection({ initialData = null }: Props) {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  const [data, setData] = useState<MonthlyPlansData>(() => {
    if (initialData && initialData.allMediaItems.length > 0) {
      return initialData;
    }
    return {
      plans: [],
      allMediaItems: [],
      months: [],
    };
  });

  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const [isHovered, setIsHovered] = useState(false);

  // Carousel State
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Fetch client-side if initialData was not present
  useEffect(() => {
    if (initialData && initialData.allMediaItems.length > 0) return;

    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/monthly-plans");
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && json?.data) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load monthly plans:", err);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [initialData]);

  const items = data.allMediaItems;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: items.length > 2,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });

  // Re-initialize carousel options when items load
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit({
        loop: items.length > 2,
        align: "start",
        containScroll: "trimSnaps",
        dragFree: false,
      });
    }
  }, [emblaApi, items.length]);

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

  // Auto-run carousel timer (matching other carousels on the site)
  useEffect(() => {
    if (!emblaApi || items.length <= 1 || modalIndex !== null || isHovered) return;

    const intervalId = window.setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [emblaApi, items.length, modalIndex, isHovered]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalIndex]);

  // Keyboard navigation for modal
  useEffect(() => {
    if (modalIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalIndex(null);
      } else if (e.key === "ArrowLeft") {
        setModalIndex((prev) =>
          prev !== null ? (prev > 0 ? prev - 1 : items.length - 1) : null
        );
      } else if (e.key === "ArrowRight") {
        setModalIndex((prev) =>
          prev !== null ? (prev < items.length - 1 ? prev + 1 : 0) : null
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalIndex, items.length]);

  const activeModalItem =
    modalIndex !== null ? items[modalIndex] ?? null : null;

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      scrollReveal("[data-monthly-plan-reveal]", {
        trigger: sectionRef.current,
        start: "top 78%",
        stagger: 0.12,
        y: 28,
      });
    },
    { scope: sectionRef }
  );

  // If no items are found at all, return null gracefully
  if (items.length === 0) {
    return null;
  }

  const sectionCopy = t.monthlyPlansSection;
  const maxVisibleDots = 7;

  return (
    <section
      ref={sectionRef}
      id="monthly-plans"
      className="relative overflow-hidden bg-gradient-to-b from-cream via-white to-cream/60 px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
    >
      {/* Decorative ambient background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-emerald-light/5 blur-3xl" />
        <div className="absolute -right-20 top-1/2 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div
          data-monthly-plan-reveal
          className={`text-center ${language === "ur" ? "font-urdu" : ""}`}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-deep">
              {sectionCopy.badge}
            </span>
          </div>

          <h2
            className={`mb-4 text-3xl font-bold tracking-tight text-emerald-deep sm:text-4xl lg:text-5xl ${
              language === "ur" ? "leading-[1.8]" : "font-display"
            }`}
          >
            {sectionCopy.title}
          </h2>

          <p
            className={`mx-auto max-w-3xl text-emerald-deep/80 sm:text-lg ${
              language === "ur" ? "leading-[2.2]" : "leading-relaxed"
            }`}
          >
            {sectionCopy.subtitle}
          </p>
        </div>

        {/* Embla Carousel Viewport with generous vertical padding to prevent top/bottom clipping */}
        <div
          className="mt-8 overflow-hidden py-4 sm:py-6"
          ref={emblaRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="-ml-3 flex touch-pan-y sm:-ml-4 items-center">
            {items.map((item, index) => {
              const isVideo = item.mediaType === "video";

              return (
                <div
                  key={item.id}
                  className="min-w-0 flex-[0_0_85%] pl-3 sm:flex-[0_0_calc(50%-8px)] sm:pl-4 lg:flex-[0_0_calc(33.333%-11px)] py-2"
                >
                  <div
                    onClick={() => setModalIndex(index)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setModalIndex(index);
                      }
                    }}
                    className="group relative flex aspect-[4/3] w-full cursor-pointer select-none flex-col items-center justify-center overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald/15 bg-[#fff8ea] p-2.5 sm:p-3.5 shadow-md shadow-emerald-deep/5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald/30 hover:shadow-xl focus:outline-none focus-visible:outline-none active:scale-[0.99]"
                  >
                    {isVideo ? (
                      <div className="relative h-full w-full overflow-hidden rounded-xl bg-black/10 flex items-center justify-center">
                        <video
                          src={item.url}
                          preload="metadata"
                          muted
                          playsInline
                          className="h-full w-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                        {/* Centered Golden Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-all group-hover:bg-black/30">
                          <div className="flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gold text-white shadow-xl shadow-gold/40 transition-transform duration-300 group-hover:scale-110">
                            <PlayIcon className="h-6 w-6 ml-0.5 fill-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation: Left Arrow + Circle Dots (max 7) + Right Arrow */}
        {scrollSnaps.length > 1 && (
          <div
            dir="ltr"
            className="mt-6 sm:mt-8 flex items-center justify-center gap-3 sm:gap-4"
          >
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
              aria-label={sectionCopy.previous}
              className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full border border-emerald-deep/15 bg-white text-emerald-deep shadow-md transition hover:bg-emerald-deep hover:text-cream active:scale-95 disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-emerald-deep"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center justify-center gap-2">
              {scrollSnaps.map((_, index) => {
                const distance = Math.abs(index - selectedIndex);
                const wrappedDistance = Math.min(
                  distance,
                  Math.abs(distance - scrollSnaps.length)
                );
                const isVisibleDot =
                  wrappedDistance <= Math.floor(maxVisibleDots / 2);

                if (!isVisibleDot) return null;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => emblaApi?.scrollTo(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={index === selectedIndex ? "true" : undefined}
                    className={`rounded-full transition-all duration-300 ${
                      index === selectedIndex
                        ? "h-2.5 w-8 bg-gradient-to-r from-[#d4af37] to-[#064635]"
                        : wrappedDistance <= 1
                          ? "h-2.5 w-2.5 bg-emerald-deep/25 hover:bg-emerald-deep/40"
                          : "h-2 w-2 bg-emerald-deep/18 hover:bg-emerald-deep/32"
                    }`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
              aria-label={sectionCopy.next}
              className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full border border-emerald-deep/15 bg-white text-emerald-deep shadow-md transition hover:bg-emerald-deep hover:text-cream active:scale-95 disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-emerald-deep"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Website-Style Image/Video Popup Modal */}
      {modalIndex !== null && activeModalItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
          {/* Backdrop with website style */}
          <div
            className="absolute inset-0 bg-emerald-deep/60 backdrop-blur-sm"
            onClick={() => setModalIndex(null)}
            aria-hidden
          />

          {/* Modal Container */}
          <div
            role="dialog"
            aria-modal="true"
            dir={language === "ur" ? "rtl" : "ltr"}
            lang={language === "ur" ? "ur" : "en"}
            className="relative flex max-h-[94vh] w-[94vw] max-w-4xl flex-col overflow-hidden rounded-2xl bg-cream shadow-2xl border border-emerald/15"
            onClick={(e: ReactMouseEvent) => e.stopPropagation()}
          >
            {/* Top Bar with Navigation & Close Button */}
            <div className="flex items-center justify-between border-b border-emerald/10 bg-white/60 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-1.5" dir="ltr">
                {items.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setModalIndex((prev) =>
                          prev !== null
                            ? prev > 0
                              ? prev - 1
                              : items.length - 1
                            : null
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald/10 text-emerald-deep transition-colors hover:bg-emerald/20 hover:scale-105 active:scale-95"
                      aria-label={sectionCopy.previous}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setModalIndex((prev) =>
                          prev !== null
                            ? prev < items.length - 1
                              ? prev + 1
                              : 0
                            : null
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald/10 text-emerald-deep transition-colors hover:bg-emerald/20 hover:scale-105 active:scale-95"
                      aria-label={sectionCopy.next}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setModalIndex(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald/10 text-emerald-deep transition-colors hover:bg-emerald/20 hover:scale-105 active:scale-95"
                aria-label={sectionCopy.closeModal}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Media Body: ONLY the pure image/video, no text details */}
            <div className="relative flex flex-1 items-center justify-center overflow-auto p-3 sm:p-5 bg-[#fff8ea]">
              {activeModalItem.mediaType === "video" ? (
                <video
                  src={activeModalItem.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[78vh] w-auto max-w-full rounded-xl shadow-lg"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeModalItem.url}
                  alt=""
                  className="max-h-[78vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


