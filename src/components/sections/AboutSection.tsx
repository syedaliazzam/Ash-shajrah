"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { FloatingIcons } from "@/components/ui/FloatingIcons";
import { useLanguage } from "@/contexts/LanguageContext";
import { IntroductionModal } from "@/components/ui/IntroductionModal";
import { FacebookIcon } from "@/components/ui/FacebookIcon";
import { YouTubeIcon } from "@/components/ui/YouTubeIcon";

export function AboutSection() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      scrollReveal("[data-about-content]", {
        trigger: sectionRef.current,
        start: "top 85%",
        stagger: 0.15,
      });
    },
    { scope: sectionRef }
  );

  return (
    <>
      <section
        ref={sectionRef}
        id="about"
        className="relative overflow-hidden bg-white px-6 py-24 lg:px-8 lg:py-32"
      >
        <FloatingIcons />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-emerald/[0.02] to-transparent" />

        <div className="relative mx-auto max-w-7xl">
          <div data-about-content className={`text-center ${language === 'ur' ? 'font-urdu' : ''}`}>
            <span className="mb-4 inline-block rounded-full border border-emerald/20 bg-emerald/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald">
              {t.nav.about}
            </span>
            <h2 className={`mb-4 text-3xl font-bold text-emerald-deep sm:text-4xl ${language === 'ur' ? 'leading-[1.8]' : 'font-display'}`}>
              {t.about.introductionTitle}
            </h2>
          </div>

          <div data-about-content className={`mx-auto mt-8 max-w-3xl text-center flex flex-col items-center gap-6 ${language === 'ur' ? 'font-urdu' : ''}`}>
            <p className={`text-emerald-deep/80 sm:text-lg ${language === 'ur' ? 'leading-[2.2]' : 'leading-relaxed'}`}>
              {t.about.introductionBody}
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-emerald/20 bg-white px-6 py-2.5 text-sm font-semibold text-emerald transition-all hover:bg-emerald/5 hover:border-emerald/40 shadow-sm"
            >
              <span>{t.about.readMore}</span>
              <svg className={`h-4 w-4 ${language === 'ur' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Key pillars row */}
          <div data-about-content className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {[
              { key: "playgroup", en: "Play Group", ur: "پلے گروپ" },
              { key: "prepI", en: "Prep-I", ur: "پری پہلی" },
              { key: "prepII", en: "Prep-II", ur: "پری دوئم" },
              { key: "parentPartnership", en: "Parent Partnership", ur: "والدین کی شراکت" },
            ].map((item) => (
              <div
                key={item.key}
                className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-2xl border border-emerald/10 bg-white/60 p-4 text-center shadow-sm backdrop-blur-sm sm:min-h-[5rem]"
              >
                <span className={`font-semibold text-emerald-deep ${language === 'ur' ? 'font-urdu text-sm leading-[1.9]' : 'text-sm'}`}>
                  {language === 'ur' ? item.ur : item.en}
                </span>
              </div>
            ))}
          </div>

          {/* Contact & Social Links Bar with Professional Labels */}
          <div
            data-about-content
            className="mt-10 overflow-hidden rounded-2xl border border-emerald/15 bg-gradient-to-br from-emerald/[0.03] via-white to-gold/[0.03] p-4 shadow-xs backdrop-blur-sm sm:p-5"
          >
            <div className={`grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 ${language === 'ur' ? 'font-urdu' : ''}`}>
              {/* Phone / WhatsApp Card */}
              <a
                href="tel:+923101734369"
                className="group flex items-center gap-3.5 rounded-xl border border-emerald/10 bg-white/90 p-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald/40 hover:bg-emerald/[0.04] hover:shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-emerald transition-colors duration-200 group-hover:bg-emerald group-hover:text-white">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[11px] font-bold uppercase tracking-wider text-emerald/70 ${language === 'ur' ? 'font-urdu normal-case tracking-normal text-xs' : ''}`}>
                    {language === 'ur' ? 'رابطہ نمبر / واٹس ایپ' : 'Phone / WhatsApp'}
                  </p>
                  <p className="truncate text-sm font-semibold text-emerald-deep" dir="ltr">
                    0310-1734369
                  </p>
                </div>
              </a>

              {/* Email Card */}
              <a
                href="mailto:coordinator@ashshajrah.com"
                className="group flex items-center gap-3.5 rounded-xl border border-emerald/10 bg-white/90 p-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald/40 hover:bg-emerald/[0.04] hover:shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-emerald transition-colors duration-200 group-hover:bg-emerald group-hover:text-white">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[11px] font-bold uppercase tracking-wider text-emerald/70 ${language === 'ur' ? 'font-urdu normal-case tracking-normal text-xs' : ''}`}>
                    {language === 'ur' ? 'ای میل ایڈریس' : 'Email'}
                  </p>
                  <p className="truncate text-sm font-semibold text-emerald-deep" dir="ltr">
                    coordinator@ashshajrah.com
                  </p>
                </div>
              </a>

              {/* Social Channels Card */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald/10 bg-white/90 p-3.5 shadow-xs sm:col-span-2 lg:col-span-1">
                <div className="min-w-0">
                  <p className={`text-[11px] font-bold uppercase tracking-wider text-emerald/70 ${language === 'ur' ? 'font-urdu normal-case tracking-normal text-xs' : ''}`}>
                    {language === 'ur' ? 'سوشل میڈیا چینلز' : 'Social Channels'}
                  </p>
                  <p className="text-xs font-medium text-emerald-deep/80 sm:text-sm">
                    {language === 'ur' ? 'ہمارے ساتھ جڑیں' : 'Connect with Us'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/share/14nDxLKbAzj/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="group inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald/20 bg-emerald/5 text-emerald shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white"
                    title="Facebook"
                  >
                    <FacebookIcon className="h-4 w-4" />
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://youtube.com/@ashajrahlearninghub?si=HHE-UlAJyK3dbivZ"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="group inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald/20 bg-emerald/5 text-emerald shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF0000] hover:bg-[#FF0000] hover:text-white"
                    title="YouTube"
                  >
                    <YouTubeIcon className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <IntroductionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
