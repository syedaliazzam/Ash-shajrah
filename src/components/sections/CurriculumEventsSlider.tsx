"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import Link from "next/link";
import { FacebookIcon } from "@/components/ui/FacebookIcon";
import { EVENT_ITEMS } from "@/data/events";
import {
  formatEventTime,
  formatPublicEventDates,
  normalizePublicEventsResponse,
  type PublicEvent,
} from "@/lib/public-events";
import type { CurriculumEvent } from "@/lib/curriculum-events";

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

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest("a, button, input, textarea, select, label"));
}

function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("mobile");

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      if (width < 768) setBreakpoint("mobile");
      else if (width < 1024) setBreakpoint("tablet");
      else setBreakpoint("desktop");
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return breakpoint;
}

function getRelativeIndex(index: number, activeIndex: number, total: number) {
  let diff = index - activeIndex;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}

function getGlobeCardStyle(relativeIndex: number, breakpoint: Breakpoint): CSSProperties {
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

  const config = configs[breakpoint];

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
        transform: `translateX(calc(-50% - ${config.sideX}px)) translateY(${config.sideY}px) rotateY(${config.sideRotate}deg) scale(${config.sideScale})`,
        opacity: config.sideOpacity,
        zIndex: 35,
        filter: "blur(0.5px)",
        pointerEvents: breakpoint === "mobile" ? "none" : "auto",
      };
    case 1:
      return {
        transform: `translateX(calc(-50% + ${config.sideX}px)) translateY(${config.sideY}px) rotateY(-${config.sideRotate}deg) scale(${config.sideScale})`,
        opacity: config.sideOpacity,
        zIndex: 35,
        filter: "blur(0.5px)",
        pointerEvents: breakpoint === "mobile" ? "none" : "auto",
      };
    case -2:
      return {
        transform: `translateX(calc(-50% - ${config.backX}px)) translateY(${config.backY}px) rotateY(${config.backRotate}deg) scale(${config.backScale})`,
        opacity: config.backOpacity,
        zIndex: 25,
        filter: config.backOpacity > 0 ? "blur(1px)" : "blur(2px)",
        pointerEvents: "none",
      };
    case 2:
      return {
        transform: `translateX(calc(-50% + ${config.backX}px)) translateY(${config.backY}px) rotateY(-${config.backRotate}deg) scale(${config.backScale})`,
        opacity: config.backOpacity,
        zIndex: 25,
        filter: config.backOpacity > 0 ? "blur(1px)" : "blur(2px)",
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

function normalizeCurriculumEvents(payload: unknown): CurriculumEvent[] {
  const data =
    payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)
      ? (payload as { data: unknown[] }).data
      : [];

  return data
    .map((item): CurriculumEvent | null => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const id = typeof record.id === "string" ? record.id : "";
      const title = typeof record.title === "string" ? record.title : "";
      if (!id || !title) return null;

      return {
        id,
        title,
        description: typeof record.description === "string" ? record.description : "",
        startAt: typeof record.startAt === "string" ? record.startAt : "",
        endAt: typeof record.endAt === "string" ? record.endAt : "",
        status: typeof record.status === "string" ? record.status : "scheduled",
        imageUrl: typeof record.imageUrl === "string" ? record.imageUrl : "",
      };
    })
    .filter((event): event is CurriculumEvent => Boolean(event));
}

function getCurriculumEventText(isUrdu: boolean) {
  return {
    badge: isUrdu ? "نصاب کے ایونٹس اور سرگرمیاں" : "Curriculum & Learning Events",
    title: isUrdu
      ? "نصاب سے متعلق سیشنز، ورکشاپس اور ہماری سرگرمیاں"
      : "Curriculum events, workshops, and learning sessions",
    upcoming: isUrdu ? "آنے والا" : "Upcoming",
    live: isUrdu ? "جاری" : "Live",
    ended: isUrdu ? "ختم ہو چکا" : "Ended",
    cancelled: isUrdu ? "منسوخ" : "Cancelled",
    date: isUrdu ? "تاریخ" : "Date",
    time: isUrdu ? "وقت" : "Time",
    startTime: isUrdu ? "آغاز کا وقت" : "Start Time",
    details: isUrdu ? "تفصیل دیکھیں" : "Details",
    description: isUrdu ? "تفصیل" : "Description",
    fallbackDetails: isUrdu ? "تفصیل جلد شیئر کی جائے گی۔" : "Details will be shared soon.",
    close: isUrdu ? "بند کریں" : "Close",
    closeDetails: isUrdu ? "تفصیل بند کریں" : "Close details",
    previous: isUrdu ? "پچھلا ایونٹ" : "Previous event",
    next: isUrdu ? "اگلا ایونٹ" : "Next event",
    goTo: (index: number) => (isUrdu ? `ایونٹ ${index + 1}` : `Go to event ${index + 1}`),
  };
}

type SliderEventItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  dateBadge?: string;
  categoryLabel?: string;
  date?: string;
  startTime?: string;
  buttonHref?: string;
  buttonLabel?: string;
  buttonExternal?: boolean;
  showFacebookIcon?: boolean;
  fit?: "cover" | "contain";
  rawCurriculumEvent?: CurriculumEvent;
};

function getEventLifecycleLabel(event: CurriculumEvent, text: ReturnType<typeof getCurriculumEventText>) {
  if (event.status === "cancelled") return text.cancelled;

  const now = Date.now();
  const start = new Date(event.startAt).getTime();
  const end = new Date(event.endAt).getTime();

  if (!Number.isNaN(end) && end < now) return text.ended;
  if (!Number.isNaN(start) && !Number.isNaN(end) && start <= now && end >= now) return text.live;
  return text.upcoming;
}

function CurriculumEventFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_30%_25%,rgba(212,175,55,0.3),transparent_36%),linear-gradient(135deg,#064635,#2d8a6a)] px-6 text-center text-cream">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cream/25 bg-cream/10">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M5 4h14v16H5z" strokeLinejoin="round" />
          <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cream/85">Curriculum Event</p>
    </div>
  );
}

function CurriculumEventDetailsModal({
  event,
  isUrdu,
  onClose,
}: {
  event: CurriculumEvent;
  isUrdu: boolean;
  onClose: () => void;
}) {
  const text = getCurriculumEventText(isUrdu);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center px-2 pb-6 pt-3 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-emerald-deep/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="curriculum-event-modal-title"
        dir={isUrdu ? "rtl" : "ltr"}
        lang={isUrdu ? "ur" : "en"}
        className={`relative flex max-h-[96vh] w-[94vw] max-w-3xl flex-col overflow-hidden rounded-2xl bg-cream shadow-2xl sm:max-h-[min(85vh,100dvh)] sm:w-[92vw] ${
          isUrdu ? "text-right font-urdu" : "text-left"
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-emerald/10 bg-white/60 px-4 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-deep">
              {getEventLifecycleLabel(event, text)}
            </span>
            <h2
              id="curriculum-event-modal-title"
              className={`mt-2 text-lg font-bold text-emerald-deep sm:text-2xl ${
                isUrdu ? "leading-[1.7]" : "font-display"
              }`}
            >
              {event.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald/10 text-emerald-deep transition-colors hover:bg-emerald/20"
            aria-label={text.closeDetails}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <div className="relative mx-auto h-[min(52vh,420px)] w-full overflow-hidden rounded-2xl bg-[#fff8ea]">
            {event.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.imageUrl} alt={event.title} className="h-full w-full object-contain p-3" />
            ) : (
              <CurriculumEventFallback />
            )}
          </div>

          <div className="mt-5 grid gap-3 rounded-2xl border border-emerald/10 bg-white/55 p-4 text-sm text-emerald-deep sm:grid-cols-2">
            <div>
              <span className="font-semibold">{text.date}:</span>{" "}
              <span dir="ltr" className="inline-block [unicode-bidi:isolate]">{formatPublicEventDates(event)}</span>
            </div>
            <div>
              <span className="font-semibold">{text.startTime}:</span>{" "}
              <span dir="ltr" className="inline-block [unicode-bidi:isolate]">{formatEventTime(event.startAt)}</span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-emerald/10 bg-white/55 p-4">
            <h3 className={`text-lg font-bold text-emerald-deep ${isUrdu ? "leading-[1.8]" : "font-display"}`}>
              {text.description}
            </h3>
            <p className={`mt-2 text-emerald-deep/85 sm:text-lg ${isUrdu ? "leading-[2.1]" : "leading-relaxed"}`}>
              {event.description || text.fallbackDetails}
            </p>
          </div>
        </div>

        <div className="border-t border-emerald/10 bg-white/40 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-emerald/20 bg-emerald px-6 py-2.5 text-sm font-semibold text-cream transition hover:bg-emerald-light"
          >
            {text.close}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CurriculumEventsSlider({
  language,
  initialEvents = [],
  initialPastEvents = [],
}: {
  language: "en" | "ur";
  initialEvents?: CurriculumEvent[];
  initialPastEvents?: PublicEvent[];
}) {
  const isUrdu = language === "ur";
  const text = getCurriculumEventText(isUrdu);
  const [curriculumEvents, setCurriculumEvents] = useState<CurriculumEvent[]>(() => initialEvents || []);
  const [publicPastEvents, setPublicPastEvents] = useState<PublicEvent[]>(() => initialPastEvents || []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<CurriculumEvent | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const breakpoint = useBreakpoint();
  const dragStartXRef = useRef<number | null>(null);
  const dragMovedRef = useRef(false);
  const maxVisibleDots = 7;

  useEffect(() => {
    if (initialEvents && initialEvents.length > 0) return;

    let cancelled = false;

    const loadEvents = async () => {
      try {
        const response = await fetch("/api/curriculum-events", {
          method: "GET",
        });
        if (!response.ok) return;

        const payload = await response.json().catch(() => ({}));
        if (!cancelled) setCurriculumEvents(normalizeCurriculumEvents(payload));
      } catch {
        if (!cancelled) setCurriculumEvents([]);
      }
    };

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, [initialEvents]);

  useEffect(() => {
    if (initialPastEvents && initialPastEvents.length > 0) return;

    let cancelled = false;

    const loadPastPublicEvents = async () => {
      try {
        const response = await fetch("/api/public-events", {
          method: "GET",
        });
        if (!response.ok) return;

        const payload = await response.json().catch(() => ({}));
        const normalized = normalizePublicEventsResponse(payload);
        if (!cancelled) setPublicPastEvents(normalized.past);
      } catch {
        if (!cancelled) setPublicPastEvents([]);
      }
    };

    void loadPastPublicEvents();

    return () => {
      cancelled = true;
    };
  }, [initialPastEvents]);

  const events = useMemo<SliderEventItem[]>(() => {
    const list: SliderEventItem[] = [];
    const seenIds = new Set<string>();

    // 1. Add curriculum events
    curriculumEvents.forEach((ev) => {
      if (!seenIds.has(ev.id)) {
        seenIds.add(ev.id);
        list.push({
          id: ev.id,
          title: ev.title,
          description: ev.description,
          imageUrl: ev.imageUrl,
          dateBadge: formatPublicEventDates(ev),
          categoryLabel: getEventLifecycleLabel(ev, text),
          date: formatPublicEventDates(ev),
          startTime: formatEventTime(ev.startAt),
          rawCurriculumEvent: ev,
          buttonLabel: text.details,
          fit: "contain",
        });
      }
    });

    // 2. Add public events from database (past events)
    publicPastEvents.forEach((ev) => {
      const id = `public-event-${ev.id}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        list.push({
          id,
          title: ev.title || "Public Event",
          description: ev.description || "Public event details are available on the events page.",
          imageUrl: ev.imageUrl || "/images/events/facebook-event-fallback.jpg",
          dateBadge: formatPublicEventDates(ev),
          categoryLabel: isUrdu ? "عوامی ایونٹ" : "Public Event",
          date: formatPublicEventDates(ev),
          startTime: formatEventTime(ev.startAt),
          buttonHref: `/events/${ev.slug}`,
          buttonLabel: isUrdu ? "ویو ڈیٹیلز" : "View Details",
          buttonExternal: false,
          showFacebookIcon: false,
          fit: "cover",
        });
      }
    });

    // 3. Add curated static events from EVENT_ITEMS (Our Events)
    EVENT_ITEMS.forEach((item) => {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        const itemDate = item.date || "";
        list.push({
          id: item.id,
          title: item.title[language] || item.title.en,
          description: item.description[language] || item.description.en,
          imageUrl: item.thumbnail || "/images/events/facebook-event-fallback.jpg",
          dateBadge: itemDate,
          categoryLabel: item.category[language] || item.category.en,
          date: itemDate,
          buttonHref: item.buttonHref || item.facebookUrl,
          buttonLabel:
            item.buttonLabel?.[language] || (isUrdu ? "فیس بک پر دیکھیں" : "View on Facebook"),
          buttonExternal: item.buttonExternal !== false && !item.buttonHref,
          showFacebookIcon: item.showFacebookIcon !== false,
          fit: item.fit || "cover",
        });
      }
    });

    return list;
  }, [curriculumEvents, publicPastEvents, language, isUrdu, text]);

  const total = events.length;

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
    }, 5200);
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
    <div id="events" className={`mt-14 scroll-mt-24 ${isUrdu ? "font-urdu text-right" : "text-left"}`}>
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex rounded-full border border-gold/25 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-deep">
          {text.badge}
        </span>
        <h3 className={`mt-3 text-2xl font-bold text-emerald-deep sm:text-3xl ${isUrdu ? "leading-[1.8]" : "font-display leading-tight"}`}>
          {text.title}
        </h3>
      </div>

      <div className="relative mt-10 w-full max-w-full overflow-x-hidden" dir="ltr">
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handlePointerUp}
          className="relative mx-auto h-[620px] w-full max-w-full touch-none cursor-grab overflow-hidden [perspective:1400px] active:cursor-grabbing sm:h-[680px] sm:[perspective:1800px] lg:h-[760px]"
        >
          <div
            className="pointer-events-none absolute left-1/2 top-[58%] h-[100px] w-[min(70%,640px)] -translate-x-1/2 rounded-[100%] bg-emerald-deep/10 blur-2xl"
            aria-hidden
          />

          {events.map((event, index) => {
            const relative = getRelativeIndex(index, activeIndex, total);
            const style = getGlobeCardStyle(relative, breakpoint);
            const isVisible = Math.abs(relative) <= 2;
            const imageFailed = imageErrors[event.id] === true;

            return (
              <div
                key={event.id}
                className="absolute left-1/2 top-0 w-[82vw] max-w-[330px] transform-gpu transition-all duration-700 ease-in-out will-change-transform [transform-style:preserve-3d] sm:w-[360px] sm:max-w-none md:w-[380px] lg:w-[460px]"
                style={style}
                aria-hidden={!isVisible || relative !== 0}
              >
                <article
                  dir={isUrdu ? "rtl" : "ltr"}
                  lang={isUrdu ? "ur" : "en"}
                  onDragStart={(dragEvent) => dragEvent.preventDefault()}
                  className={`group flex h-full select-none flex-col overflow-hidden rounded-3xl border border-emerald/12 bg-white shadow-[0_20px_50px_rgba(13,59,46,0.12)] transition-all duration-500 hover:border-gold/35 hover:shadow-[0_28px_60px_rgba(13,59,46,0.16)] ${
                    isUrdu ? "text-right font-urdu" : "text-left"
                  }`}
                >
                  <div className="relative h-56 w-full overflow-hidden rounded-t-3xl bg-[#fff8ea] sm:h-64 lg:h-[360px]">
                    {event.imageUrl && !imageFailed ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className={`h-full w-full ${event.fit === "contain" ? "object-contain p-3" : "object-cover object-top"} transition-transform duration-500 group-hover:scale-[1.03]`}
                        draggable={false}
                        onError={() => setImageErrors((current) => ({ ...current, [event.id]: true }))}
                      />
                    ) : (
                      <CurriculumEventFallback />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-deep/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    {event.dateBadge ? (
                      <span className="absolute left-4 top-4 max-w-[calc(100%-2rem)] truncate rounded-full border border-white/40 bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-deep shadow-sm" title={event.dateBadge}>
                        {event.dateBadge}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-1 select-none flex-col p-5 sm:p-6">
                    <span className="inline-flex w-fit rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-deep">
                      {event.categoryLabel}
                    </span>
                    <h4 className={`mt-3 line-clamp-2 text-xl font-bold leading-snug text-emerald-deep sm:text-2xl ${isUrdu ? "leading-[1.8]" : "font-display"}`}>
                      {event.title}
                    </h4>
                    {event.date || event.startTime ? (
                      <div className="mt-3 grid gap-2 rounded-2xl bg-cream/60 p-3 text-xs text-emerald-deep/80">
                        {event.date ? (
                          <div>
                            <span className="font-semibold">{text.date}:</span>{" "}
                            <span dir="ltr" className="inline-block [unicode-bidi:isolate]">{event.date}</span>
                          </div>
                        ) : null}
                        {event.startTime ? (
                          <div>
                            <span className="font-semibold">{text.startTime}:</span>{" "}
                            <span dir="ltr" className="inline-block [unicode-bidi:isolate]">{event.startTime}</span>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    <p className={`mt-3 line-clamp-3 flex-1 text-sm leading-7 text-emerald-deep/75 sm:text-base ${isUrdu ? "leading-[2]" : ""}`}>
                      {event.description || text.fallbackDetails}
                    </p>

                    {event.buttonHref ? (
                      event.buttonExternal ? (
                        <a
                          href={event.buttonHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`mt-5 inline-flex min-h-11 w-full select-auto items-center justify-center gap-2 rounded-full border border-emerald/20 bg-emerald px-5 py-2.5 text-sm font-semibold text-cream transition-all duration-300 hover:border-gold/40 hover:bg-emerald-light sm:w-auto ${
                            isUrdu ? "sm:self-end font-urdu" : "sm:self-start"
                          }`}
                        >
                          {event.showFacebookIcon ? <FacebookIcon className="h-4 w-4 shrink-0" /> : null}
                          {event.buttonLabel}
                        </a>
                      ) : (
                        <Link
                          href={event.buttonHref}
                          className={`mt-5 inline-flex min-h-11 w-full select-auto items-center justify-center gap-2 rounded-full border border-emerald/20 bg-emerald px-5 py-2.5 text-sm font-semibold text-cream transition-all duration-300 hover:border-gold/40 hover:bg-emerald-light sm:w-auto ${
                            isUrdu ? "sm:self-end font-urdu" : "sm:self-start"
                          }`}
                        >
                          {event.showFacebookIcon ? <FacebookIcon className="h-4 w-4 shrink-0" /> : null}
                          {event.buttonLabel}
                        </Link>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (event.rawCurriculumEvent) {
                            setSelectedEvent(event.rawCurriculumEvent);
                          }
                        }}
                        className={`mt-5 inline-flex min-h-11 w-full select-auto items-center justify-center rounded-full bg-emerald px-5 py-3 text-sm font-semibold text-cream transition-all duration-300 hover:bg-emerald-light sm:w-auto ${
                          isUrdu ? "sm:self-end" : "sm:self-start"
                        }`}
                      >
                        {event.buttonLabel || text.details}
                      </button>
                    )}
                  </div>
                </article>
              </div>
            );
          })}

          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={goPrev}
            aria-label={text.previous}
            className="pointer-events-auto absolute left-3 top-[42%] z-[80] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-deep/15 bg-white/95 text-emerald-deep shadow-xl transition hover:bg-emerald-deep hover:text-cream sm:flex sm:left-4 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
          >
            <ChevronLeft />
          </button>

          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={goNext}
            aria-label={text.next}
            className="pointer-events-auto absolute right-3 top-[42%] z-[80] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-deep/15 bg-white/95 text-emerald-deep shadow-xl transition hover:bg-emerald-deep hover:text-cream sm:flex sm:right-4 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
          >
            <ChevronRight />
          </button>
        </div>

        <div className="mt-6 flex max-w-full flex-wrap justify-center gap-2 overflow-hidden px-4 sm:px-6">
          {events.map((event, index) => {
            const distance = Math.abs(index - activeIndex);
            const wrappedDistance = Math.min(distance, Math.abs(distance - total));
            const isVisibleDot = wrappedDistance <= Math.floor(maxVisibleDots / 2);

            if (!isVisibleDot) return null;

            return (
              <button
                key={event.id}
                type="button"
                onPointerDown={(pointerEvent) => pointerEvent.stopPropagation()}
                onClick={() => setActiveIndex(index)}
                aria-label={text.goTo(index)}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`rounded-full transition-all ${
                  index === activeIndex
                    ? "h-2 w-7 bg-gradient-to-r from-[#d4af37] to-[#064635]"
                    : wrappedDistance <= 1
                      ? "h-2 w-2 bg-emerald-deep/30 hover:bg-emerald-deep/45"
                      : "h-1.5 w-1.5 bg-emerald-deep/18 hover:bg-emerald-deep/32"
                }`}
              />
            );
          })}
        </div>
      </div>

      {selectedEvent ? (
        <CurriculumEventDetailsModal
          event={selectedEvent}
          isUrdu={isUrdu}
          onClose={() => setSelectedEvent(null)}
        />
      ) : null}
    </div>
  );
}
