"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PublicEventRegistrationModal } from "@/components/events/PublicEventRegistrationModal";
import { Header } from "@/components/layout/Header";
import { PublicEventsGlobeCarousel } from "@/components/sections/PublicEventsGlobeCarousel";
import { useLanguage } from "@/contexts/LanguageContext";
import { EVENT_ITEMS } from "@/data/events";
import {
  formatEventDate,
  formatEventFee,
  formatEventTime,
  normalizePublicEventsResponse,
  type PublicEvent,
} from "@/lib/public-events";

function extractApiError(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.error === "string" && record.error.trim()) return record.error;
    if (typeof record.message === "string" && record.message.trim()) return record.message;
  }
  return fallback;
}

function slugifyEventTitle(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "event"
  );
}

function mapStaticEventToPublicEvent(item: (typeof EVENT_ITEMS)[number], index: number): PublicEvent {
  const title = item.title.en || item.title.ur || `Past Event ${index + 1}`;
  const description = item.description.en || item.description.ur || "Details will be shared soon.";
  const staticDate = item.date?.trim() || "2024-01-01";

  return {
    id: `static-event-${item.id}`,
    slug: slugifyEventTitle(title),
    title,
    description,
    imageUrl: item.thumbnail,
    startAt: staticDate,
    endAt: staticDate,
    fee: "",
    capacity: "",
    registrationDeadline: staticDate,
    lifecycle: "past",
    ctaHref: item.facebookUrl,
    ctaLabel: "Facebook",
    ctaExternal: true,
    showFacebookIcon: true,
  };
}

function EventSlider({
  title,
  description,
  events,
  emptyText,
  viewDetailsLabel,
  singleEventActionLabel,
  onSingleEventAction,
}: {
  title: string;
  description: string;
  events: PublicEvent[];
  emptyText: string;
  viewDetailsLabel: string;
  singleEventActionLabel: string;
  onSingleEventAction?: (event: PublicEvent) => void;
}) {
  const { language } = useLanguage();
  const isUrdu = language === "ur";
  const isSingleCurrentUpcoming = title.toLowerCase().includes("current") || title.toLowerCase().includes("موجودہ");
  const eventMetaText = {
    current: isUrdu ? "موجودہ" : "Current",
    upcoming: isUrdu ? "آنے والا" : "Upcoming",
    startDate: isUrdu ? "تاریخ" : "Date",
    startTime: isUrdu ? "آغاز کا وقت" : "Start Time",
    endTime: isUrdu ? "اختتامی وقت" : "End Time",
    fee: isUrdu ? "فیس" : "Fee",
    registrationDeadlineDate: isUrdu ? "رجسٹریشن کی آخری تاریخ" : "Registration Deadline Date",
    registrationDeadlineTime: isUrdu ? "رجسٹریشن کا آخری وقت" : "Registration Deadline Time",
    description: isUrdu ? "تفصیل" : "Description",
    detailsFallback: isUrdu ? "مزید تفصیل جلد شیئر کی جائے گی۔" : "More details will be shared soon.",
  };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-emerald-deep sm:text-4xl">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-emerald-deep/75 sm:text-base">
          {description}
        </p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-[28px] border border-emerald/10 bg-white/80 px-6 py-10 text-sm text-emerald-deep/70 shadow-[0_18px_60px_rgba(13,59,46,0.06)]">
          {emptyText}
        </div>
      ) : events.length === 1 && isSingleCurrentUpcoming ? (
        <article className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="min-w-0 overflow-hidden rounded-[32px] border border-emerald/10 bg-white/90 shadow-[0_24px_70px_rgba(13,59,46,0.08)]">
            <div className="relative flex w-full items-start justify-center overflow-hidden bg-[#fff8ea] p-0">
              {events[0].imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={events[0].imageUrl}
                  alt={events[0].title}
                  className="block w-full max-w-full object-contain"
                />
              ) : (
                <div className="flex h-[320px] w-full items-center justify-center bg-gradient-to-br from-emerald-deep via-emerald to-gold/70 px-6 text-center text-white sm:h-[380px] lg:h-[520px]">
                  <span className="font-display text-2xl font-bold">{events[0].title}</span>
                </div>
              )}
              <span className="absolute left-5 top-5 rounded-full border border-white bg-white px-4 py-2 text-xs font-semibold text-emerald-deep shadow-md">
                {events[0].lifecycle === "current" ? eventMetaText.current : eventMetaText.upcoming}
              </span>
            </div>
          </div>

          <div className="min-w-0 rounded-[32px] border border-emerald/10 bg-[linear-gradient(180deg,#ffffff,#faf7f0)] p-6 shadow-[0_24px_70px_rgba(13,59,46,0.08)] sm:p-8">
            <h3 className="font-display text-3xl font-bold tracking-tight text-emerald-deep sm:text-4xl">
              {events[0].title}
            </h3>

            <div className="mt-6 grid gap-4 rounded-[28px] border border-emerald/10 bg-cream/65 p-5 text-sm text-emerald-deep sm:grid-cols-2">
              <div><span className="font-semibold">{eventMetaText.startDate}:</span> <span dir="ltr" className="inline-block [unicode-bidi:isolate]">{formatEventDate(events[0].startAt)}</span></div>
              <div><span className="font-semibold">{eventMetaText.startTime}:</span> <span dir="ltr" className="inline-block [unicode-bidi:isolate]">{formatEventTime(events[0].startAt)}</span></div>
              <div><span className="font-semibold">{eventMetaText.endTime}:</span> <span dir="ltr" className="inline-block [unicode-bidi:isolate]">{formatEventTime(events[0].endAt)}</span></div>
              <div><span className="font-semibold">{eventMetaText.fee}:</span> <span dir="ltr" className="inline-block [unicode-bidi:isolate]">{formatEventFee(events[0].fee, "Contact for details")}</span></div>
              <div><span className="font-semibold">{eventMetaText.registrationDeadlineDate}:</span> <span dir="ltr" className="inline-block [unicode-bidi:isolate]">{formatEventDate(events[0].registrationDeadline)}</span></div>
              <div><span className="font-semibold">{eventMetaText.registrationDeadlineTime}:</span> <span dir="ltr" className="inline-block [unicode-bidi:isolate]">{formatEventTime(events[0].registrationDeadline)}</span></div>
            </div>

            <div className="mt-6 min-w-0 rounded-[28px] border border-emerald/10 bg-white/80 p-5">
              <h4 className="font-display text-2xl font-bold tracking-tight text-emerald-deep">
                {eventMetaText.description}
              </h4>
              <div className="mt-3 whitespace-pre-line [overflow-wrap:anywhere] text-sm leading-8 text-emerald-deep/80 sm:text-base">
                {events[0].description || eventMetaText.detailsFallback}
              </div>
            </div>

            <div className="mt-8">
              {onSingleEventAction ? (
                <button
                  type="button"
                  onClick={() => onSingleEventAction(events[0])}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-deep px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold hover:text-emerald-deep"
                >
                  {singleEventActionLabel}
                </button>
              ) : (
                <Link
                  href={`/events/${events[0].slug}`}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-deep px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold hover:text-emerald-deep"
                >
                  {singleEventActionLabel}
                </Link>
              )}
            </div>
          </div>
        </article>
      ) : (
        <PublicEventsGlobeCarousel events={events} viewDetailsLabel={viewDetailsLabel} />
      )}
    </section>
  );
}

function EventsLoadingState() {
  return (
    <div className="space-y-8">
      <div className="rounded-[30px] border border-emerald/10 bg-white/85 p-6 shadow-[0_18px_60px_rgba(13,59,46,0.06)]">
        <div className="animate-pulse">
          <div className="h-4 w-36 rounded-full bg-gold/25" />
          <div className="mt-4 h-10 max-w-xl rounded-2xl bg-emerald-deep/10" />
          <div className="mt-3 h-4 max-w-2xl rounded-full bg-emerald-deep/10" />
          <div className="mt-2 h-4 max-w-lg rounded-full bg-emerald-deep/10" />
        </div>
      </div>

      <div className="relative mx-auto h-[620px] w-full max-w-7xl overflow-hidden rounded-[34px] border border-emerald/10 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.16),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,244,236,0.96))] shadow-[0_24px_70px_rgba(13,59,46,0.08)]">
        <div className="absolute left-1/2 top-[62%] h-24 w-[min(70%,620px)] -translate-x-1/2 rounded-[999px] bg-emerald-deep/10 blur-2xl" />
        <div className="absolute left-1/2 top-10 w-[min(88vw,340px)] -translate-x-1/2 animate-pulse sm:w-[min(70vw,380px)] lg:w-[min(42vw,420px)]">
          <div className="overflow-hidden rounded-3xl border border-emerald/12 bg-white shadow-[0_20px_50px_rgba(13,59,46,0.12)]">
            <div className="h-56 bg-gradient-to-br from-emerald-deep/15 via-emerald/10 to-gold/15 sm:h-64" />
            <div className="space-y-4 p-6">
              <div className="h-6 w-28 rounded-full bg-gold/20" />
              <div className="h-8 w-4/5 rounded-2xl bg-emerald-deep/10" />
              <div className="h-4 w-full rounded-full bg-emerald-deep/10" />
              <div className="h-4 w-3/4 rounded-full bg-emerald-deep/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PublicEventsPageContent({
  initialCurrentUpcoming = [],
  initialPast = [],
}: {
  initialCurrentUpcoming?: PublicEvent[];
  initialPast?: PublicEvent[];
}) {
  const { language } = useLanguage();
  const isUrdu = language === "ur";
  const [loading, setLoading] = useState(
    initialCurrentUpcoming.length === 0 && initialPast.length === 0
  );
  const [loadError, setLoadError] = useState("");
  const [currentUpcoming, setCurrentUpcoming] = useState<PublicEvent[]>(initialCurrentUpcoming);
  const [past, setPast] = useState<PublicEvent[]>(initialPast);
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);

  const staticPastEvents = useMemo(
    () => EVENT_ITEMS.map((item, index) => mapStaticEventToPublicEvent(item, index)),
    []
  );

  const mergedPastEvents = useMemo(() => {
    const existingIds = new Set(past.map((item) => item.id));
    const existingTitles = new Set(past.map((item) => item.title.trim().toLowerCase()));
    const dedupedStatic = staticPastEvents.filter(
      (item) => !existingIds.has(item.id) && !existingTitles.has(item.title.trim().toLowerCase())
    );
    return [...past, ...dedupedStatic];
  }, [past, staticPastEvents]);

  const uiText = {
    loadError: isUrdu ? "اس وقت عوامی ایونٹس لوڈ نہیں ہو سکے۔" : "Unable to load public events right now.",
    publicEvents: isUrdu ? "عوامی ایونٹس" : "Public Events",
    heroTitle: isUrdu
      ? "اش الشجرہ کے عوامی ایونٹس، ورکشاپس، اور رہنمائی سیشنز میں شامل ہوں"
      : "Join Ash-Shajrah public events, workshops, and guided learning sessions",
    heroBody: isUrdu
      ? "موجودہ، آنے والے، اور گزشتہ عوامی ایونٹس دیکھیے۔ کھلے ایونٹس کی مکمل تفصیل دیکھنے کے لیے ویو ڈیٹیلز استعمال کریں۔"
      : "Explore current, upcoming, and past public events. Open any current or upcoming event to review full details and register from its dedicated page.",
    currentUpcoming: isUrdu ? "موجودہ / آنے والے ایونٹس" : "Current / Upcoming Events",
    currentUpcomingBody: isUrdu
      ? "نئے رجسٹریشن کے لیے دستیاب ایونٹس یہاں دکھائے جاتے ہیں۔ مکمل تفصیل دیکھنے کے لیے ویو ڈیٹیلز کھولیں۔"
      : "Open events are listed here for new registrations. Use View Details to open the full event page.",
    pastEvents: isUrdu ? "گزشتہ ایونٹس" : "Past Events",
    pastEventsBody: isUrdu
      ? "مکمل ہو چکے عوامی ایونٹس اور ورکشاپس کے ساتھ ہماری منتخب تقاریب بھی یہاں شامل ہیں۔"
      : "A record of recently completed public events and workshops, along with selected past events from our archive.",
    noEvents: isUrdu ? "اس حصے میں ابھی کوئی ایونٹس دستیاب نہیں ہیں۔" : "No events are available in this section yet.",
    viewDetails: isUrdu ? "ویو ڈیٹیلز" : "View Details",
    joinEvent: isUrdu ? "ایونٹ جوائن کریں" : "Join Event",
  };

  useEffect(() => {
    if (initialCurrentUpcoming.length > 0 || initialPast.length > 0) {
      setCurrentUpcoming(initialCurrentUpcoming);
      setPast(initialPast);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadEvents = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await fetch("/api/public-events", {
          method: "GET",
          cache: "no-store",
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(extractApiError(payload, uiText.loadError));
        }

        const normalized = normalizePublicEventsResponse(payload);
        if (cancelled) return;

        setCurrentUpcoming(normalized.currentUpcoming);
        setPast(normalized.past);
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : uiText.loadError);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, [initialCurrentUpcoming, initialPast, uiText.loadError]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f4ecda_0%,#faf7f1_42%,#f3eee5_100%)] pb-24 pt-28 sm:pt-32">
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div
              dir={isUrdu ? "rtl" : "ltr"}
              className={`rounded-[30px] border border-emerald/10 bg-[linear-gradient(135deg,rgba(13,59,46,0.96),rgba(19,92,69,0.92))] px-5 py-7 text-cream shadow-[0_24px_80px_rgba(13,59,46,0.18)] sm:px-8 sm:py-9 ${
                isUrdu ? "font-urdu text-right" : ""
              }`}
            >
              <span className="inline-flex rounded-full border border-gold/35 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-gold-soft">
                {uiText.publicEvents}
              </span>
              <h1 className="mt-4 max-w-3xl font-display text-xl font-bold leading-tight tracking-tight text-cream sm:text-2xl lg:text-3xl">
                {uiText.heroTitle}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-cream/80">
                {uiText.heroBody}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-10">
            {loading ? (
              <EventsLoadingState />
            ) : loadError ? (
              <div className="rounded-[30px] border border-red-200 bg-white px-6 py-10 text-sm text-red-700 shadow-[0_18px_60px_rgba(13,59,46,0.06)]">
                {loadError}
              </div>
            ) : (
              <>
                <EventSlider
                  title={uiText.currentUpcoming}
                  description={uiText.currentUpcomingBody}
                  events={currentUpcoming}
                  emptyText={uiText.noEvents}
                  viewDetailsLabel={uiText.viewDetails}
                  singleEventActionLabel={uiText.joinEvent}
                  onSingleEventAction={setSelectedEvent}
                />

                <EventSlider
                  title={uiText.pastEvents}
                  description={uiText.pastEventsBody}
                  events={mergedPastEvents}
                  emptyText={uiText.noEvents}
                  viewDetailsLabel={uiText.viewDetails}
                  singleEventActionLabel={uiText.viewDetails}
                />
              </>
            )}
          </div>
        </section>
      </main>

      {selectedEvent ? (
        <PublicEventRegistrationModal
          event={selectedEvent}
          open={true}
          onClose={() => setSelectedEvent(null)}
        />
      ) : null}
    </>
  );
}
