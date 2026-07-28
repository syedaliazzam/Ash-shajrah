"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { useLanguage } from "@/contexts/LanguageContext";
import { EVENT_ITEMS, type EventItem } from "@/data/events";
import { EventsGlobeCarousel } from "@/components/sections/EventsGlobeCarousel";
import { FacebookIcon } from "@/components/ui/FacebookIcon";
import { normalizePublicEventsResponse, type PublicEvent } from "@/lib/public-events";

function formatPastEventDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Karachi",
  }).format(date);
}

function mapPublicEventToEventItem(event: PublicEvent): EventItem {
  const fallbackDescription = event.description || "Public event details are available on the events page.";
  return {
    id: `public-event-${event.id}`,
    facebookUrl: "/events",
    buttonHref: `/events/${event.slug}`,
    buttonExternal: false,
    showFacebookIcon: false,
    buttonLabel: {
      en: "View Details",
      ur: "ویو ڈیٹیلز",
    },
    showButton: true,
    thumbnail: event.imageUrl || "/images/events/facebook-event-fallback.jpg",
    fit: "cover",
    date: formatPastEventDate(event.startAt),
    category: {
      en: "Past Public Event",
      ur: "گزشتہ عوامی ایونٹ",
    },
    title: {
      en: event.title || "Past Public Event",
      ur: event.title || "گزشتہ عوامی ایونٹ",
    },
    description: {
      en: fallbackDescription,
      ur: fallbackDescription,
    },
    alt: {
      en: event.title || "Past public event thumbnail",
      ur: event.title || "گزشتہ عوامی ایونٹ تھمب نیل",
    },
  };
}

function EventsEmptyState({ message, isUrdu }: { message: string; isUrdu: boolean }) {
  return (
    <div
      className={`mx-auto max-w-xl rounded-3xl border border-emerald/15 bg-white/80 p-10 text-center shadow-lg ${
        isUrdu ? "font-urdu leading-[2.1]" : "leading-relaxed"
      }`}
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1877f2] to-emerald-deep text-white">
        <FacebookIcon className="h-7 w-7" />
      </div>
      <p className="text-lg text-emerald-deep/80">{message}</p>
    </div>
  );
}

export function OurEventsSection() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const isUrdu = language === "ur";
  const [publicPastEvents, setPublicPastEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadPastPublicEvents = async () => {
      try {
        const response = await fetch("/api/public-events", {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = await response.json().catch(() => ({}));
        const normalized = normalizePublicEventsResponse(payload);
        if (cancelled) return;

        setPublicPastEvents(normalized.past.map(mapPublicEventToEventItem));
      } catch {
        if (!cancelled) {
          setPublicPastEvents([]);
        }
      }
    };

    void loadPastPublicEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  const allEvents = useMemo(() => {
    const dynamicIds = new Set(publicPastEvents.map((event) => event.id));
    return [...EVENT_ITEMS.filter((event) => !dynamicIds.has(event.id)), ...publicPastEvents];
  }, [publicPastEvents]);

  const hasEvents = allEvents.length > 0;

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      scrollReveal("[data-events-header]", {
        trigger: sectionRef.current,
        start: "top 82%",
        y: 24,
      });

      if (hasEvents) {
        scrollReveal("[data-events-globe]", {
          trigger: sectionRef.current,
          start: "top 75%",
          y: 40,
        });
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="events"
      className="relative overflow-hidden bg-cream px-6 py-20 lg:px-8 lg:py-24"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream-dark/15 to-cream" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(201,162,39,0.1),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(24,119,242,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(45,138,106,0.06),transparent_50%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div
          data-events-header
          className={`mx-auto max-w-3xl text-center ${isUrdu ? "font-urdu" : ""}`}
        >
          <h2
            className={`mb-4 text-3xl font-bold text-emerald-deep sm:text-4xl ${
              isUrdu ? "leading-[1.8]" : "font-display"
            }`}
          >
            {t.events.title}
          </h2>
          <p
            className={`text-emerald-deep/80 sm:text-lg ${
              isUrdu ? "leading-[2.2]" : "leading-relaxed"
            }`}
          >
            {t.events.subtitle}
          </p>
        </div>

        {!hasEvents ? (
          <div className="mt-12">
            <EventsEmptyState message={t.events.empty} isUrdu={isUrdu} />
          </div>
        ) : (
          <div data-events-globe>
            <EventsGlobeCarousel
              events={allEvents}
              language={language}
              buttonLabel={t.events.button}
              fallbackBadge={t.events.fallbackBadge}
            />
          </div>
        )}
      </div>
    </section>
  );
}
