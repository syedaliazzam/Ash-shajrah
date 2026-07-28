"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
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

function ArrowUpRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M7 17 17 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UpcomingEventAlert() {
  const { language } = useLanguage();
  const isUrdu = language === "ur";
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<PublicEvent | null>(null);

  const uiText = {
    loadError: isUrdu ? "ایونٹ نوٹس اس وقت دستیاب نہیں۔" : "Upcoming event notice is unavailable right now.",
    badge: isUrdu ? "جلد آرہا ہے" : "Upcoming Event",
    openLabel: isUrdu ? "تفصیل نئے ٹیب میں کھولیں" : "Open details in new tab",
  };

  useEffect(() => {
    let cancelled = false;

    const loadUpcoming = async () => {
      setLoading(true);
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
        const nearestUpcoming =
          normalized.currentUpcoming.find((item) => item.lifecycle === "upcoming") || null;

        if (!cancelled) {
          setEvent(nearestUpcoming);
        }
      } catch {
        if (!cancelled) {
          setEvent(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadUpcoming();

    return () => {
      cancelled = true;
    };
  }, [uiText.loadError]);

  if (loading || !event) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-24 z-40 w-[min(92vw,280px)] sm:right-6 sm:top-28">
      <div
        dir={isUrdu ? "rtl" : "ltr"}
        className={`pointer-events-auto rounded-[22px] border border-gold/35 bg-[linear-gradient(135deg,rgba(255,251,243,0.98),rgba(247,241,230,0.98))] p-4 shadow-[0_20px_60px_rgba(13,59,46,0.18)] backdrop-blur-md ${
          isUrdu ? "font-urdu text-right" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
              {uiText.badge}
            </span>
            <p className="mt-3 line-clamp-2 text-base font-semibold leading-6 text-emerald-deep">
              {event.title}
            </p>
          </div>

          <Link
            href={`/events/${event.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={uiText.openLabel}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald/15 bg-white text-emerald-deep transition hover:border-gold hover:bg-gold/10 hover:text-gold"
          >
            <ArrowUpRightIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}
