"use client";

import { useId, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function TechnologyAdvisorySection() {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  return (
    <section
      aria-label="Technology advisory partner"
      className="border-t border-emerald/8 bg-cream px-5 py-8 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl border border-emerald/12 bg-white/75 px-5 py-5 shadow-sm shadow-emerald-deep/5 backdrop-blur-sm sm:px-6 sm:py-6">
          <div
            className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gold/70 via-gold-soft/50 to-emerald-light/40"
            aria-hidden
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1 pl-2 sm:pl-3">
              {/* Header */}
              <div className={`flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4 ${language === 'ur' ? 'sm:flex-row-reverse sm:justify-end' : 'sm:justify-between'}`}>
                <div className={`flex items-center gap-2 ${language === 'ur' ? 'flex-row-reverse' : ''}`}>
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald/12 bg-emerald/[0.06] text-emerald"
                    aria-hidden
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                      <path
                        d="M12 3l1.5 5h5l-4 3.5 1.2 4.5L12 14l-3.7 2 1.2-4.5L5.5 8h5L12 3z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <h2 className={`${language === 'ur' ? 'font-urdu' : 'tracking-wide'} text-sm font-semibold text-[#063F32] sm:text-[0.9375rem]`}>
                    {t.techAdvisory.title}
                  </h2>
                </div>
              </div>

              {/* Body */}
              <div className={`mt-2.5 ${language === 'ur' ? 'text-right' : 'text-left'}`}>
                <p className={`${language === 'ur' ? 'font-urdu text-xs leading-[2.1] sm:text-sm' : 'text-sm leading-relaxed sm:text-[0.9375rem] sm:leading-[1.65]'} text-[#245C4F]`}>
                  {t.techAdvisory.body}
                </p>
              </div>

              {/* Expandable details */}
              <div
                id={panelId}
                className="grid transition-[grid-template-rows] duration-500 ease-in-out motion-reduce:transition-none"
                style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
                aria-hidden={!expanded}
              >
                <div className="overflow-hidden">
                  <div className={`pt-4 ${language === 'ur' ? 'text-right' : 'text-left'}`}>
                    <p className={`${language === 'ur' ? 'font-urdu text-sm leading-[2.1]' : 'text-sm leading-relaxed sm:text-[0.9375rem] sm:leading-[1.7]'} text-[#245C4F]/90`}>
                      {t.techAdvisory.expandedBody}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              aria-controls={panelId}
              className={`shrink-0 self-start rounded-full border border-emerald/15 bg-cream/80 px-4 py-2 text-xs font-semibold text-[#0D5C48] transition-all duration-300 hover:border-gold/35 hover:bg-white hover:text-[#063F32] sm:mt-1 ${language === 'ur' ? 'font-urdu' : ''}`}
            >
              {expanded ? t.techAdvisory.showLess : t.techAdvisory.learnMore}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
