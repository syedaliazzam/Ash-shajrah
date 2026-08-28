"use client";

import Link from "next/link";
import { useState } from "react";
import { FacebookIcon } from "@/components/ui/FacebookIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatEventDate, formatEventFee, formatEventTime, type PublicEvent } from "@/lib/public-events";

function getLifecycleLabel(value: PublicEvent["lifecycle"], isUrdu: boolean) {
  if (value === "current") return isUrdu ? "موجودہ" : "Current";
  if (value === "past") return isUrdu ? "گزشتہ" : "Past";
  return isUrdu ? "آنے والا" : "Upcoming";
}

function getLifecycleClasses(value: PublicEvent["lifecycle"]) {
  if (value === "current") {
    return "border-emerald/25 bg-emerald/10 text-emerald-deep";
  }
  if (value === "past") {
    return "border-stone-300 bg-stone-100 text-stone-700";
  }
  return "border-gold/40 bg-gold/10 text-[#8a6a12]";
}

function EventThumbnailFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-emerald-deep via-emerald to-[#1877f2]/70 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-white/90">
        Event Preview
      </p>
    </div>
  );
}

export function PublicEventCard({
  event,
  ctaLabel,
  ctaHref,
}: {
  event: PublicEvent;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const { language } = useLanguage();
  const isUrdu = language === "ur";
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedLabel = event.ctaLabel || ctaLabel;
  const resolvedHref = event.ctaHref || ctaHref;
  const isExternal = event.ctaExternal === true;
  const showFacebookIcon = event.showFacebookIcon === true;
  const showMetaFields = !isExternal;
  const eventMetaText = {
    startDate: isUrdu ? "آغاز کی تاریخ" : "Start Date",
    startTime: isUrdu ? "آغاز کا وقت" : "Start Time",
    endTime: isUrdu ? "اختتامی وقت" : "End Time",
    fee: isUrdu ? "فیس" : "Fee",
    registrationDeadlineDate: isUrdu ? "رجسٹریشن کی آخری تاریخ" : "Registration Deadline Date",
    registrationDeadlineTime: isUrdu ? "رجسٹریشن کا آخری وقت" : "Registration Deadline Time",
  };

  return (
    <article
      dir={isUrdu ? "rtl" : "ltr"}
      className={`group flex h-full w-full select-none flex-col overflow-hidden rounded-3xl border border-emerald/12 bg-white shadow-[0_20px_50px_rgba(13,59,46,0.14)] transition-all duration-500 hover:border-gold/35 hover:shadow-[0_28px_60px_rgba(13,59,46,0.18)] ${
        isUrdu ? "text-right font-urdu" : "text-left"
      }`}
    >
      <div className="relative h-56 w-full overflow-hidden rounded-t-3xl bg-[#fff8ea] sm:h-64">
        {event.imageUrl && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt={event.title}
            className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <EventThumbnailFallback />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-deep/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute left-4 top-4 rounded-full border border-white bg-white px-3 py-1 text-xs font-semibold text-emerald-deep shadow-md">
          {formatEventDate(event.startAt)}
        </span>
      </div>

      <div className="flex flex-1 select-none flex-col p-5 sm:p-6">
        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${getLifecycleClasses(
            event.lifecycle
          )}`}
        >
          {getLifecycleLabel(event.lifecycle, isUrdu)}
        </span>
        <h3 className="mt-3 line-clamp-2 font-display text-lg leading-snug text-emerald-deep sm:text-xl">
          {event.title || "Untitled Event"}
        </h3>
        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-emerald-deep/75 sm:text-base">
          {event.description || "Details will be shared soon."}
        </p>

        {showMetaFields ? (
          <div className="mt-4 grid gap-2 text-xs text-emerald-deep/80 sm:text-sm">
            <div className="leading-relaxed">
              <span className="font-semibold text-emerald-deep">{eventMetaText.startDate}:</span>{" "}
              <span dir="ltr" className="inline-block text-left [unicode-bidi:isolate]">
                {formatEventDate(event.startAt)}
              </span>
            </div>
            <div className="leading-relaxed">
              <span className="font-semibold text-emerald-deep">{eventMetaText.startTime}:</span>{" "}
              <span dir="ltr" className="inline-block text-left [unicode-bidi:isolate]">
                {formatEventTime(event.startAt)}
              </span>
            </div>
            <div className="leading-relaxed">
              <span className="font-semibold text-emerald-deep">{eventMetaText.endTime}:</span>{" "}
              <span dir="ltr" className="inline-block text-left [unicode-bidi:isolate]">
                {formatEventTime(event.endAt)}
              </span>
            </div>
            <div className="leading-relaxed">
              <span className="font-semibold text-emerald-deep">{eventMetaText.fee}:</span>{" "}
              <span dir="ltr" className="inline-block text-left [unicode-bidi:isolate]">
                {formatEventFee(event.fee, "Contact for details")}
              </span>
            </div>
            <div className="leading-relaxed">
              <span className="font-semibold text-emerald-deep">{eventMetaText.registrationDeadlineDate}:</span>{" "}
              <span dir="ltr" className="inline-block text-left [unicode-bidi:isolate]">
                {formatEventDate(event.registrationDeadline)}
              </span>
            </div>
            <div className="leading-relaxed">
              <span className="font-semibold text-emerald-deep">{eventMetaText.registrationDeadlineTime}:</span>{" "}
              <span dir="ltr" className="inline-block text-left [unicode-bidi:isolate]">
                {formatEventTime(event.registrationDeadline)}
              </span>
            </div>
          </div>
        ) : null}

        {resolvedLabel && resolvedHref ? (
          <div className="mt-5">
            {isExternal ? (
              <a
                href={resolvedHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-deep bg-emerald-deep px-5 py-2 text-sm font-semibold text-cream transition hover:border-gold hover:bg-gold hover:text-emerald-deep"
              >
                {showFacebookIcon ? <FacebookIcon className="h-4 w-4 shrink-0" /> : null}
                {resolvedLabel}
              </a>
            ) : (
              <Link
                href={resolvedHref}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-emerald-deep bg-emerald-deep px-5 py-2 text-sm font-semibold text-cream transition hover:border-gold hover:bg-gold hover:text-emerald-deep"
              >
                {resolvedLabel}
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}
