"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  formatEventDate,
  formatEventTime,
  hasRegistrationDeadlinePassed,
  type PublicEvent,
} from "@/lib/public-events";
import { PublicEventRegistrationModal } from "@/components/events/PublicEventRegistrationModal";

export function PublicEventDetailPageContent({ event }: { event: PublicEvent }) {
  const { language } = useLanguage();
  const isUrdu = language === "ur";
  const [modalOpen, setModalOpen] = useState(false);
  const deadlinePassed = hasRegistrationDeadlinePassed(event.registrationDeadline);
  const isPast = event.lifecycle === "past";
  const joinDisabled = isPast || deadlinePassed;

  const uiText = {
    backToEvents: isUrdu ? "ØªÙ…Ø§Ù… Ø§ÛŒÙˆÙ†Ù¹Ø³" : "All Events",
    joinEvent: isUrdu ? "Ø§ÛŒÙˆÙ†Ù¹ Ø¬ÙˆØ§Ø¦Ù† Ú©Ø±ÛŒÚº" : "Join Event",
    closed: isUrdu ? "Ø±Ø¬Ø³Ù¹Ø±ÛŒØ´Ù† Ø¨Ù†Ø¯ ÛÛ’" : "Registration Closed",
    current: isUrdu ? "Ù…ÙˆØ¬ÙˆØ¯Û" : "Current",
    upcoming: isUrdu ? "Ø¢Ù†Û’ ÙˆØ§Ù„Ø§" : "Upcoming",
    past: isUrdu ? "Ú¯Ø²Ø´ØªÛ" : "Past",
    start: isUrdu ? "Ø¢ØºØ§Ø²" : "Start",
    end: isUrdu ? "Ø§Ø®ØªØªØ§Ù…" : "End",
    startDate: isUrdu ? "Ø¢ØºØ§Ø² Ú©ÛŒ ØªØ§Ø±ÛŒØ®" : "Start Date",
    startTime: isUrdu ? "Ø¢ØºØ§Ø² Ú©Ø§ ÙˆÙ‚Øª" : "Start Time",
    endDate: isUrdu ? "Ø§Ø®ØªØªØ§Ù… Ú©ÛŒ ØªØ§Ø±ÛŒØ®" : "End Date",
    endTime: isUrdu ? "Ø§Ø®ØªØªØ§Ù… Ú©Ø§ ÙˆÙ‚Øª" : "End Time",
    fee: isUrdu ? "ÙÛŒØ³" : "Fee",
    deadlineDate: isUrdu ? "Ø±Ø¬Ø³Ù¹Ø±ÛŒØ´Ù† Ø¢Ø®Ø±ÛŒ ØªØ§Ø±ÛŒØ®" : "Registration Deadline Date",
    deadlineTime: isUrdu ? "Ø±Ø¬Ø³Ù¹Ø±ÛŒØ´Ù† Ø¢Ø®Ø±ÛŒ ÙˆÙ‚Øª" : "Registration Deadline Time",
    fullDetails: isUrdu ? "ØªÙØµÛŒÙ„" : "Description",
    descriptionFallback: isUrdu ? "Ù…Ø²ÛŒØ¯ ØªÙØµÛŒÙ„Ø§Øª Ø¬Ù„Ø¯ Ø´ÛŒØ¦Ø± Ú©ÛŒ Ø¬Ø§Ø¦ÛŒÚº Ú¯ÛŒÛ”" : "More details will be shared soon.",
  };

  const badgeLabel =
    event.lifecycle === "current"
      ? uiText.current
      : event.lifecycle === "past"
        ? uiText.past
        : uiText.upcoming;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f4ecda_0%,#faf7f1_42%,#f3eee5_100%)] pb-24 pt-28 sm:pt-32">
        <section className="px-4 sm:px-6 lg:px-8">
          <div
            dir={isUrdu ? "rtl" : "ltr"}
            className={`mx-auto max-w-7xl ${isUrdu ? "font-urdu text-right" : ""}`}
          >
            <Link
              href="/events"
              className="inline-flex items-center rounded-full border border-emerald/15 bg-white/90 px-4 py-2 text-sm font-semibold text-emerald-deep transition hover:border-gold hover:text-gold"
            >
              {uiText.backToEvents}
            </Link>

            <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="min-w-0 overflow-hidden rounded-[32px] border border-emerald/10 bg-white/90 shadow-[0_24px_70px_rgba(13,59,46,0.08)]">
                <div className="relative h-[240px] bg-[#fff8ea] sm:h-[300px] lg:h-[540px]">
                  {event.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={event.imageUrl} alt={event.title} className="block h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-deep via-emerald to-gold/70 px-6 text-center text-white">
                      <span className="font-display text-2xl font-bold">{event.title}</span>
                    </div>
                  )}
                  <span className="absolute left-5 top-5 rounded-full border border-white bg-white px-4 py-2 text-xs font-semibold text-emerald-deep shadow-md">
                    {badgeLabel}
                  </span>
                </div>
              </div>

              <div className="min-w-0 rounded-[32px] border border-emerald/10 bg-[linear-gradient(180deg,#ffffff,#faf7f0)] p-6 shadow-[0_24px_70px_rgba(13,59,46,0.08)] sm:p-8">
                <h1 className="font-display text-3xl font-bold tracking-tight text-emerald-deep sm:text-4xl">
                  {event.title}
                </h1>

                <div className="mt-6 grid gap-4 rounded-[28px] border border-emerald/10 bg-cream/65 p-5 text-sm text-emerald-deep sm:grid-cols-2">
                  <div><span className="font-semibold">{uiText.startDate}:</span> {formatEventDate(event.startAt)}</div>
                  <div><span className="font-semibold">{uiText.startTime}:</span> {formatEventTime(event.startAt)}</div>
                  <div><span className="font-semibold">{uiText.endDate}:</span> {formatEventDate(event.endAt)}</div>
                  <div><span className="font-semibold">{uiText.endTime}:</span> {formatEventTime(event.endAt)}</div>
                  <div><span className="font-semibold">{uiText.fee}:</span> {event.fee || "0"}</div>
                  <div><span className="font-semibold">{uiText.deadlineDate}:</span> {formatEventDate(event.registrationDeadline)}</div>
                  <div><span className="font-semibold">{uiText.deadlineTime}:</span> {formatEventTime(event.registrationDeadline)}</div>
                </div>

                <div className="mt-6 min-w-0 rounded-[28px] border border-emerald/10 bg-white/80 p-5">
                  <h2 className="font-display text-2xl font-bold tracking-tight text-emerald-deep">
                    {uiText.fullDetails}
                  </h2>
                  <div className="mt-3 whitespace-pre-line break-words [overflow-wrap:anywhere] text-sm leading-8 text-emerald-deep/80 sm:text-base">
                    {event.description || uiText.descriptionFallback}
                  </div>
                </div>

                {!isPast ? (
                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      disabled={joinDisabled}
                      className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-deep px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold hover:text-emerald-deep disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {joinDisabled ? uiText.closed : uiText.joinEvent}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicEventRegistrationModal
        event={event}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

