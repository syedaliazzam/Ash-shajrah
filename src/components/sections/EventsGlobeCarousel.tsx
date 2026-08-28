"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type TouchEvent as ReactTouchEvent } from "react";
import type { EventItem } from "@/data/events";
import { EventCard } from "@/components/cards/EventCard";

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

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement
    && Boolean(target.closest("a, button, input, textarea, select, label"));
}

function useBreakpoint(): Breakpoint {
  // Mobile-first default to avoid desktop transform overflow on first paint / SSR
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
    desktop: {
      sideX: 330,
      backX: 560,
      sideY: 45,
      backY: 105,
      sideRotate: 32,
      backRotate: 48,
      sideScale: 0.86,
      backScale: 0.68,
      backOpacity: 0.32,
    },
    tablet: {
      sideX: 245,
      backX: 400,
      sideY: 40,
      backY: 90,
      sideRotate: 28,
      backRotate: 42,
      sideScale: 0.78,
      backScale: 0.64,
      backOpacity: 0.18,
    },
    mobile: {
      sideX: 155,
      backX: 260,
      sideY: 24,
      backY: 60,
      sideRotate: 16,
      backRotate: 28,
      sideScale: 0.72,
      backScale: 0.5,
      backOpacity: 0,
    },
  } as const;

  const c = configs[breakpoint];

  switch (relativeIndex) {
    case 0:
      return {
        transform: "translateX(-50%) translateY(0px) translateZ(0px) rotateY(0deg) scale(1)",
        opacity: 1,
        zIndex: 50,
        filter: "blur(0px)",
        pointerEvents: "auto",
      };
    case -1:
      return {
        transform: `translateX(calc(-50% - ${c.sideX}px)) translateY(${c.sideY}px) rotateY(${c.sideRotate}deg) scale(${c.sideScale})`,
        opacity: breakpoint === "mobile" ? 0.45 : 0.78,
        zIndex: 40,
        filter: "blur(0px)",
        pointerEvents: breakpoint === "mobile" ? "none" : "auto",
      };
    case 1:
      return {
        transform: `translateX(calc(-50% + ${c.sideX}px)) translateY(${c.sideY}px) rotateY(-${c.sideRotate}deg) scale(${c.sideScale})`,
        opacity: breakpoint === "mobile" ? 0.45 : 0.78,
        zIndex: 40,
        filter: "blur(0px)",
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

export function EventsGlobeCarousel({
  events,
  language,
  buttonLabel,
  fallbackBadge,
}: {
  events: EventItem[];
  language: "en" | "ur";
  buttonLabel: string;
  fallbackBadge: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const breakpoint = useBreakpoint();
  const total = events.length;
  const dragStartXRef = useRef<number | null>(null);
  const dragMovedRef = useRef(false);
  const maxVisibleDots = 7;

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
    }, 5500);
    return () => window.clearInterval(id);
  }, [total]);

  if (total === 0) return null;

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (total < 2) return;
    if (isInteractiveTarget(event.target)) return;
    dragStartXRef.current = event.clientX;
    dragMovedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartXRef.current === null) return;

    const deltaX = event.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) < 18 || dragMovedRef.current) return;

    dragMovedRef.current = true;
    if (deltaX < 0) goNext();
    else goPrev();
  };

  const handlePointerUp = () => {
    dragStartXRef.current = null;
    dragMovedRef.current = false;
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (total < 2) return;
    if (isInteractiveTarget(event.target)) return;
    dragStartXRef.current = event.touches[0]?.clientX ?? null;
    dragMovedRef.current = false;
  };

  const handleTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (dragStartXRef.current === null) return;

    const clientX = event.touches[0]?.clientX;
    if (typeof clientX !== "number") return;

    const deltaX = clientX - dragStartXRef.current;
    if (Math.abs(deltaX) < 18 || dragMovedRef.current) return;

    dragMovedRef.current = true;
    if (deltaX < 0) goNext();
    else goPrev();
  };

  return (
    <div className="relative mt-10 w-full max-w-full overflow-x-hidden sm:mt-14" dir="ltr">
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handlePointerUp}
        className={`relative mx-auto w-full max-w-full overflow-hidden [perspective:1400px] sm:[perspective:1800px] ${
          breakpoint === "mobile"
            ? "h-[580px] touch-none cursor-grab active:cursor-grabbing"
            : breakpoint === "tablet"
              ? "h-[640px] touch-none cursor-grab active:cursor-grabbing"
              : "h-[700px] touch-none cursor-grab active:cursor-grabbing lg:h-[720px]"
        }`}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-[58%] h-[100px] w-[min(70%,640px)] -translate-x-1/2 rounded-[100%] bg-emerald-deep/10 blur-2xl"
          aria-hidden
        />

        {events.map((item, index) => {
          const relative = getRelativeIndex(index, activeIndex, total);
          const style = getGlobeCardStyle(relative, breakpoint);
          const isVisible = Math.abs(relative) <= 2;

          return (
            <div
              key={item.id}
              className={`absolute left-1/2 top-2 w-[min(88vw,340px)] transform-gpu transition-all duration-700 ease-in-out will-change-transform [transform-style:preserve-3d] sm:top-4 sm:w-[min(70vw,380px)] lg:w-[min(42vw,420px)]`}
              style={style}
              aria-hidden={!isVisible || relative !== 0}
            >
              <EventCard
                item={item}
                language={language}
                buttonLabel={buttonLabel}
                fallbackBadge={fallbackBadge}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 sm:mt-6">
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={goPrev}
          aria-label={language === "ur" ? "پچھلا ایونٹ" : "Previous event"}
          className="pointer-events-auto hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-emerald-deep/15 bg-white text-emerald-deep shadow-lg transition hover:bg-emerald-deep hover:text-cream sm:flex sm:h-14 sm:w-14"
        >
          <ChevronLeft />
        </button>

        <div className="flex justify-center gap-2">
          {events.map((event, index) => {
            const distance = Math.abs(index - activeIndex);
            const wrappedDistance = Math.min(distance, Math.abs(distance - total));
            const isVisibleDot = wrappedDistance <= Math.floor(maxVisibleDots / 2);

            if (!isVisibleDot) return null;

            return (
            <button
              key={event.id}
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => setActiveIndex(index)}
              aria-label={
                language === "ur" ? `ایونٹ ${index + 1}` : `Go to event ${index + 1}`
              }
              aria-current={index === activeIndex ? "true" : undefined}
              className={`rounded-full transition-all ${
                index === activeIndex
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
          onPointerDown={(event) => event.stopPropagation()}
          onClick={goNext}
          aria-label={language === "ur" ? "اگلا ایونٹ" : "Next event"}
          className="pointer-events-auto hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-emerald-deep/15 bg-white text-emerald-deep shadow-lg transition hover:bg-emerald-deep hover:text-cream sm:flex sm:h-14 sm:w-14"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
