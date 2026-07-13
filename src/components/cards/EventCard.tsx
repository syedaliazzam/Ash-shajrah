"use client";

import { useState } from "react";
import type { EventItem } from "@/data/events";
import { EVENT_THUMBNAIL_FALLBACK } from "@/data/events";
import { FacebookIcon } from "@/components/ui/FacebookIcon";

function EventThumbnailFallback({ badge }: { badge: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-emerald-deep via-emerald to-[#1877f2]/70 px-6 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white">
        <FacebookIcon className="h-8 w-8" />
      </div>
      <p className="text-sm font-semibold uppercase tracking-wider text-white/90">{badge}</p>
    </div>
  );
}

export function EventCard({
  item,
  language,
  buttonLabel,
  fallbackBadge,
}: {
  item: EventItem;
  language: "en" | "ur";
  buttonLabel: string;
  fallbackBadge: string;
}) {
  const isUrdu = language === "ur";
  const [imageFailed, setImageFailed] = useState(false);
  const thumbnail = item.thumbnail || EVENT_THUMBNAIL_FALLBACK;
  const imageFitClass =
    item.fit === "contain"
      ? "object-contain p-3 transition duration-500 group-hover:scale-[1.03]"
      : "object-cover transition duration-500 group-hover:scale-[1.03]";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-emerald/12 bg-white shadow-[0_20px_50px_rgba(13,59,46,0.14)] transition-all duration-500 hover:border-gold/35 hover:shadow-[0_28px_60px_rgba(13,59,46,0.18)]">
      <div className="relative h-56 w-full overflow-hidden rounded-t-3xl bg-[#fff8ea] sm:h-64">
        {!imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element -- local optional files need reliable onError fallback
          <img
            src={thumbnail}
            alt={item.alt[language]}
            className={`h-full w-full ${imageFitClass}`}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <EventThumbnailFallback badge={fallbackBadge} />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-deep/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {item.date && (
          <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-deep shadow-sm">
            {item.date}
          </span>
        )}
      </div>

      <div
        dir={isUrdu ? "rtl" : "ltr"}
        lang={isUrdu ? "ur" : "en"}
        className={`flex flex-1 flex-col p-5 sm:p-6 ${isUrdu ? "text-right font-urdu" : "text-left"}`}
      >
        <span className="inline-flex w-fit rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-deep">
          {item.category[language]}
        </span>
        <h3
          className={`mt-3 line-clamp-2 text-lg font-bold text-emerald-deep sm:text-xl ${
            isUrdu ? "leading-[1.8]" : "font-display leading-snug"
          }`}
        >
          {item.title[language]}
        </h3>
        <p
          className={`mt-3 line-clamp-2 flex-1 text-sm text-emerald-deep/75 sm:text-base ${
            isUrdu ? "leading-[2]" : "leading-relaxed"
          }`}
        >
          {item.description[language]}
        </p>
        <a
          href={item.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-emerald/20 bg-emerald px-5 py-2.5 text-sm font-semibold text-cream transition-all duration-300 hover:border-gold/40 hover:bg-emerald-light sm:w-auto ${
            isUrdu ? "sm:self-end font-urdu" : "sm:self-start"
          }`}
        >
          <FacebookIcon className="h-4 w-4 shrink-0" />
          {buttonLabel}
        </a>
      </div>
    </article>
  );
}
