"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation, Pagination, Autoplay } from "swiper/modules";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { useLanguage } from "@/contexts/LanguageContext";
import { WORK_ITEMS, type WorkItem } from "@/data/works";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";

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

function WorkDetailModal({
  item,
  language,
  onClose,
  closeLabel,
}: {
  item: WorkItem;
  language: "en" | "ur";
  onClose: () => void;
  closeLabel: string;
}) {
  const isUrdu = language === "ur";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-emerald-deep/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="work-modal-title"
        dir={isUrdu ? "rtl" : "ltr"}
        lang={isUrdu ? "ur" : "en"}
        className={`relative flex max-h-[min(85vh,100dvh)] w-[92vw] max-w-3xl flex-col overflow-hidden rounded-2xl bg-cream shadow-2xl ${
          isUrdu ? "text-right font-urdu" : "text-left"
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-emerald/10 bg-white/60 px-4 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-deep">
              {item.category[language]}
            </span>
            <h2
              id="work-modal-title"
              className={`mt-2 text-lg font-bold text-emerald-deep sm:text-2xl ${
                isUrdu ? "leading-[1.7]" : "font-display"
              }`}
            >
              {item.title[language]}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald/10 text-emerald-deep transition-colors hover:bg-emerald/20"
            aria-label={closeLabel}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <div className="relative mx-auto h-[min(52vh,420px)] w-full overflow-hidden rounded-2xl bg-[#fff8ea]">
            <Image
              src={item.image}
              alt={item.alt[language]}
              fill
              sizes="(max-width: 768px) 90vw, 720px"
              className="object-contain p-3"
              priority
            />
          </div>
          <p
            className={`mt-5 text-emerald-deep/85 sm:text-lg ${
              isUrdu ? "leading-[2.1]" : "leading-relaxed"
            }`}
          >
            {item.details[language]}
          </p>
        </div>

        <div className="border-t border-emerald/10 bg-white/40 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-emerald/20 bg-emerald px-6 py-2.5 text-sm font-semibold text-cream transition hover:bg-emerald-light"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkCard({
  item,
  language,
  readMoreLabel,
  onReadMore,
}: {
  item: WorkItem;
  language: "en" | "ur";
  readMoreLabel: string;
  onReadMore: (item: WorkItem) => void;
}) {
  const isUrdu = language === "ur";
  const imageFitClass =
    item.fit === "contain"
      ? "object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"
      : "object-cover transition-transform duration-500 group-hover:scale-[1.03]";

  return (
    <article
      dir={isUrdu ? "rtl" : "ltr"}
      lang={isUrdu ? "ur" : "en"}
      className={`group flex h-full flex-col overflow-hidden rounded-3xl border border-emerald/12 bg-white shadow-[0_20px_50px_rgba(13,59,46,0.12)] transition-all duration-500 hover:border-gold/35 hover:shadow-[0_28px_60px_rgba(13,59,46,0.16)] ${
        isUrdu ? "text-right font-urdu" : "text-left"
      }`}
    >
      <div className="relative h-[280px] w-full overflow-hidden rounded-t-3xl bg-[#fff8ea] sm:h-[320px] lg:h-[360px]">
        <Image
          src={item.image}
          alt={item.alt[language]}
          fill
          sizes="(max-width: 768px) 90vw, 460px"
          className={imageFitClass}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-deep/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
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
        <button
          type="button"
          onClick={() => onReadMore(item)}
          className={`mt-5 inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-emerald/20 bg-emerald px-5 py-2.5 text-sm font-semibold text-cream transition-all duration-300 hover:border-gold/40 hover:bg-emerald-light sm:w-fit ${
            isUrdu ? "sm:self-end" : "sm:self-start"
          }`}
        >
          {readMoreLabel}
        </button>
      </div>
    </article>
  );
}

export function OurWorksSection() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const isUrdu = language === "ur";
  const [selected, setSelected] = useState<WorkItem | null>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      scrollReveal("[data-works-header]", {
        trigger: sectionRef.current,
        start: "top 82%",
        y: 24,
      });

      scrollReveal("[data-works-carousel]", {
        trigger: sectionRef.current,
        start: "top 75%",
        y: 40,
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="works"
      className="relative overflow-hidden bg-cream px-6 py-20 lg:px-8 lg:py-24"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream-dark/15 to-cream" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(201,162,39,0.1),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(45,138,106,0.06),transparent_50%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div
          data-works-header
          className={`mx-auto max-w-3xl text-center ${isUrdu ? "font-urdu" : ""}`}
        >
          <h2
            className={`mb-4 text-3xl font-bold text-emerald-deep sm:text-4xl ${
              isUrdu ? "leading-[1.8]" : "font-display"
            }`}
          >
            {t.works.title}
          </h2>
          <p
            className={`text-emerald-deep/80 sm:text-lg ${
              isUrdu ? "leading-[2.2]" : "leading-relaxed"
            }`}
          >
            {t.works.description}
          </p>
        </div>

        <div data-works-carousel className="relative mt-10 w-full max-w-full overflow-x-hidden sm:mt-14">
          <button
            type="button"
            className="works-prev absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-deep/15 bg-white text-emerald-deep shadow-xl transition hover:bg-emerald-deep hover:text-cream sm:left-3 sm:h-14 sm:w-14 lg:left-0 lg:-translate-x-1/2"
            aria-label={isUrdu ? "پچھلا کام" : "Previous work"}
          >
            <ChevronLeft />
          </button>

          <button
            type="button"
            className="works-next absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-deep/15 bg-white text-emerald-deep shadow-xl transition hover:bg-emerald-deep hover:text-cream sm:right-3 sm:h-14 sm:w-14 lg:right-0 lg:translate-x-1/2"
            aria-label={isUrdu ? "اگلا کام" : "Next work"}
          >
            <ChevronRight />
          </button>

          <div dir="ltr" className="works-coverflow overflow-hidden px-12 sm:overflow-visible sm:px-14 lg:px-16">
            <Swiper
              modules={[EffectCoverflow, Navigation, Pagination, Autoplay]}
              effect="coverflow"
              grabCursor
              centeredSlides
              loop
              slidesPerView="auto"
              speed={700}
              coverflowEffect={{
                rotate: 18,
                stretch: 0,
                depth: 180,
                modifier: 1.6,
                slideShadows: false,
              }}
              navigation={{
                nextEl: ".works-next",
                prevEl: ".works-prev",
              }}
              pagination={{
                clickable: true,
                el: ".works-pagination",
              }}
              autoplay={{
                delay: 4500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              breakpoints={{
                0: {
                  slidesPerView: 1,
                },
                768: {
                  slidesPerView: "auto",
                },
                1024: {
                  slidesPerView: "auto",
                },
              }}
              className="works-swiper py-6 sm:py-8"
            >
              {WORK_ITEMS.map((item) => (
                <SwiperSlide
                  key={item.id}
                  className="!w-[min(88vw,340px)] sm:!w-[min(70vw,380px)] lg:!w-[min(42vw,460px)]"
                >
                  <WorkCard
                    item={item}
                    language={language}
                    readMoreLabel={t.works.readMore}
                    onReadMore={setSelected}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="works-pagination mt-6 flex justify-center gap-2 sm:mt-10" />
        </div>
      </div>

      {selected && (
        <WorkDetailModal
          item={selected}
          language={language}
          onClose={() => setSelected(null)}
          closeLabel={t.works.close}
        />
      )}
    </section>
  );
}
