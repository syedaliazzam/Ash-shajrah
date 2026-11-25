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
import type { TrainingSessionVideo } from "@/lib/training-sessions";

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

function ExpandIcon({ className = "h-5 w-5" }: { className?: string }) {
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
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
      />
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

function getCopy(isUrdu: boolean) {
  return {
    badge: isUrdu ? "ٹریننگ سیشنز" : "Training Sessions",
    title: isUrdu ? "ٹریننگ سیشنز" : "Training Sessions",
    subtitle: isUrdu
      ? "اساتذہ کی تربیت، بچوں کی رہنمائی اور تعلیمی تدریس کے معلوماتی سیشنز ملاحظہ فرمائیں۔"
      : "Watch our exclusive training sessions, teacher guidance workshops, and developmental learning demonstrations.",
    videoBadge: isUrdu ? "ٹریننگ سیشن" : "Training Session",
    watchVideo: isUrdu ? "دیکھیں" : "View Session",
    closeModal: isUrdu ? "بند کریں" : "Close",
    previous: isUrdu ? "پچھلا" : "Previous",
    next: isUrdu ? "اگلا" : "Next",
    counter: isUrdu ? "آئٹم" : "Item",
    of: isUrdu ? "از" : "of",
  };
}

type Props = {
  initialVideos?: TrainingSessionVideo[];
};

export function TrainingSessionsSection({ initialVideos = [] }: Props) {
  const { language } = useLanguage();
  const isUrdu = language === "ur";
  const copy = getCopy(isUrdu);

  const sectionRef = useRef<HTMLElement>(null);
  const [videos, setVideos] = useState<TrainingSessionVideo[]>(initialVideos);
  const [isLoading, setIsLoading] = useState<boolean>(() => initialVideos.length === 0);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  useEffect(() => {
    setIsVideoLoading(true);
  }, [modalIndex]);

  // Carousel State
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Lazy-load media indices: initially only load first 4 slides
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(
    () => new Set([0, 1, 2, 3])
  );

  // Client-side fetch fallback
  useEffect(() => {
    if (initialVideos.length > 0) {
      setVideos(initialVideos);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const loadVideos = async () => {
      try {
        const res = await fetch("/api/training-sessions", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch training sessions");
        const json = await res.json();
        if (!cancelled && Array.isArray(json?.data)) {
          setVideos(json.data);
        }
      } catch (err) {
        console.error("Training sessions client fetch error:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadVideos();
    return () => {
      cancelled = true;
    };
  }, [initialVideos]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: videos.length > 2,
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
    duration: 30,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());

    setLoadedIndices((prev) => {
      const next = new Set(prev);
      for (let i = -1; i <= 3; i++) {
        const target = (index + i + videos.length) % videos.length;
        next.add(target);
      }
      return next;
    });
  }, [emblaApi, videos.length]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Autoplay pause when hovered or modal open
  useEffect(() => {
    if (!emblaApi || isHovered || modalIndex !== null || videos.length <= 1) return;
    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [emblaApi, isHovered, modalIndex, videos.length]);

  // Lock background scroll when modal open
  useEffect(() => {
    if (modalIndex === null) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
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
          prev !== null ? (prev > 0 ? prev - 1 : videos.length - 1) : null
        );
      } else if (e.key === "ArrowRight") {
        setModalIndex((prev) =>
          prev !== null ? (prev < videos.length - 1 ? prev + 1 : 0) : null
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalIndex, videos.length]);

  const activeVideo = modalIndex !== null ? videos[modalIndex] ?? null : null;

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      scrollReveal("[data-training-sessions-reveal]", {
        trigger: sectionRef.current,
        start: "top 78%",
        stagger: 0.12,
        y: 28,
      });
    },
    { scope: sectionRef }
  );

  // If finished loading and empty, do not show empty section
  if (videos.length === 0) {
    if (!isLoading) {
      return null;
    }
    return (
      <section
        id="training-sessions"
        className="relative overflow-hidden bg-gradient-to-b from-cream via-white to-cream/60 px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
      >
        <div className="relative mx-auto max-w-7xl">
          <div className={`text-center ${isUrdu ? "font-urdu" : ""}`}>
            <h2
              className={`mb-4 text-3xl font-bold tracking-tight text-emerald-deep sm:text-4xl lg:text-5xl ${
                isUrdu ? "leading-[1.8]" : "font-display"
              }`}
            >
              {copy.title}
            </h2>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="aspect-[4/3] rounded-2xl bg-emerald-deep/5 animate-pulse border border-emerald/10"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const maxVisibleDots = 7;

  return (
    <section
      ref={sectionRef}
      id="training-sessions"
      className="relative overflow-hidden bg-gradient-to-b from-cream/80 via-white to-cream/50 px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
    >
      {/* Decorative ambient background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-emerald-light/5 blur-3xl" />
        <div className="absolute -right-20 top-1/2 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div
          data-training-sessions-reveal
          className={`text-center ${isUrdu ? "font-urdu" : ""}`}
        >
          <h2
            className={`mb-4 text-3xl font-bold tracking-tight text-emerald-deep sm:text-4xl lg:text-5xl ${
              isUrdu ? "leading-[1.8]" : "font-display"
            }`}
          >
            {copy.title}
          </h2>

          <p
            className={`mx-auto max-w-3xl text-emerald-deep/80 sm:text-lg ${
              isUrdu ? "leading-[2.2]" : "leading-relaxed"
            }`}
          >
            {copy.subtitle}
          </p>
        </div>

        {/* Embla Carousel Viewport */}
        <div
          className="mt-8 overflow-hidden py-4 sm:py-6"
          ref={emblaRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="-ml-3 flex touch-pan-y sm:-ml-4 items-center">
            {videos.map((item, index) => {
              const shouldLoad = loadedIndices.has(index);

              return (
                <div
                  key={item.id}
                  className="min-w-0 flex-[0_0_88%] pl-3 sm:flex-[0_0_calc(50%-8px)] sm:pl-4 lg:flex-[0_0_calc(33.333%-11px)] py-2"
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
                    <div className="relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-br from-emerald-950/20 via-black/20 to-emerald-950/30 flex items-center justify-center">
                      {item.mediaType === "image" ? (
                        shouldLoad ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.url}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="h-full w-full bg-emerald-950/10" />
                        )
                      ) : (
                        shouldLoad ? (
                          <video
                            src={`${item.url}#t=0.1`}
                            preload="metadata"
                            muted
                            playsInline
                            className="h-full w-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="h-full w-full bg-emerald-950/10" />
                        )
                      )}

                      {/* Centered Action Button */}
                      {item.mediaType === "image" ? (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:bg-black/30">
                          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/95 text-emerald-deep shadow-xl backdrop-blur-xs transition-transform duration-300 group-hover:scale-110">
                            <ExpandIcon className="h-5 w-5" />
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-all duration-300 group-hover:bg-black/35">
                          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gold text-white shadow-xl shadow-gold/40 transition-transform duration-300 group-hover:scale-110">
                            <PlayIcon className="h-6 w-6 ml-0.5 fill-white text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation: Left Arrow + Circle Dots + Right Arrow */}
        {scrollSnaps.length > 1 && (
          <div
            dir="ltr"
            className="mt-6 sm:mt-8 flex items-center justify-center gap-3 sm:gap-4"
          >
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
              aria-label={copy.previous}
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
              aria-label={copy.next}
              className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full border border-emerald-deep/15 bg-white text-emerald-deep shadow-md transition hover:bg-emerald-deep hover:text-cream active:scale-95 disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-emerald-deep"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Website Theme Video Lightbox Modal */}
      {modalIndex !== null && activeVideo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
          {/* Backdrop with brand theme emerald blur */}
          <div
            className="absolute inset-0 bg-emerald-deep/60 backdrop-blur-sm transition-opacity"
            onClick={() => setModalIndex(null)}
          />

          <div
            className="relative z-10 flex max-h-[94vh] w-[95vw] max-w-4xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald/20 bg-[#fffdf7] shadow-2xl"
            onClick={(e: ReactMouseEvent) => e.stopPropagation()}
          >
            {/* Modal Header in Brand Theme */}
            <div className="flex items-center justify-between border-b border-emerald/15 bg-white/80 backdrop-blur-md px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2" dir="ltr">
                {videos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setModalIndex((prev) =>
                          prev !== null ? (prev > 0 ? prev - 1 : videos.length - 1) : null
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald/10 text-emerald-deep transition-all hover:bg-emerald/20 active:scale-95"
                      aria-label={copy.previous}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setModalIndex((prev) =>
                          prev !== null ? (prev < videos.length - 1 ? prev + 1 : 0) : null
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald/10 text-emerald-deep transition-all hover:bg-emerald/20 active:scale-95"
                      aria-label={copy.next}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <span className="ml-2 text-xs font-semibold text-emerald-deep/70">
                      {modalIndex + 1} {copy.of} {videos.length}
                    </span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setModalIndex(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald/10 text-emerald-deep transition-colors hover:bg-emerald/20 hover:scale-105 active:scale-95"
                aria-label={copy.closeModal}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Modal Media Player / Image Lightbox */}
            {activeVideo.mediaType === "image" ? (
              <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-[#fff8ea] to-[#f4ede0] p-3 sm:p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={activeVideo.id}
                  src={activeVideo.url}
                  alt=""
                  className="max-h-[78vh] w-auto max-w-full rounded-xl border border-emerald/15 shadow-xl object-contain bg-white"
                />
              </div>
            ) : (
              <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-[#fff8ea] to-[#f4ede0] p-3 sm:p-5">
                <video
                  key={activeVideo.id}
                  src={activeVideo.url}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  onLoadStart={() => setIsVideoLoading(true)}
                  onLoadedData={() => setIsVideoLoading(false)}
                  onCanPlay={() => setIsVideoLoading(false)}
                  onWaiting={() => setIsVideoLoading(true)}
                  onPlaying={() => setIsVideoLoading(false)}
                  className="max-h-[78vh] w-auto max-w-full rounded-xl border border-emerald/15 shadow-xl bg-black"
                />

                {/* Buffer / Loading Spinner for large video files */}
                {isVideoLoading && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-emerald-deep/20 backdrop-blur-xs">
                    <div className="h-10 w-10 rounded-full border-3 border-gold/30 border-t-gold animate-spin" />
                    <span className="rounded-full bg-emerald-deep/85 px-3 py-1 text-xs font-medium text-cream shadow-md">
                      {isUrdu ? "ویڈیو لوڈ ہو رہی ہے..." : "Loading video..."}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
