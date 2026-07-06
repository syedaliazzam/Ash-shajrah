"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { useLanguage } from "@/contexts/LanguageContext";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2);
}

export function LeadershipSection() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      scrollReveal("[data-leader-card]", {
        trigger: sectionRef.current,
        start: "top 75%",
        stagger: 0.2,
        y: 50,
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="leadership"
      className="relative overflow-hidden bg-gradient-to-b from-cream to-emerald-deep/5 px-6 py-24 lg:px-8 lg:py-32"
    >
      <div className="relative mx-auto max-w-7xl">
        <div className={`text-center mb-16 ${language === 'ur' ? 'font-urdu' : ''}`}>
          <span className="mb-4 inline-block rounded-full border border-emerald/20 bg-emerald/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald">
            {language === 'ur' ? 'قیادت' : 'Leadership'}
          </span>
          <h2 className={`mb-4 text-3xl font-bold text-emerald-deep sm:text-4xl ${language === 'ur' ? 'leading-[1.8]' : 'font-display'}`}>
            {t.leadership.title}
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {t.leadership.items.map((leader: { name: string; title: string; bio: string; focus: string[] }) => (
            <article
              key={leader.name}
              data-leader-card
              className="group relative overflow-hidden rounded-3xl border border-gold/25 bg-white p-8 shadow-xl shadow-emerald-deep/5 transition-shadow hover:shadow-2xl hover:shadow-emerald/10 md:p-10"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold via-emerald-light to-gold" />
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/5 blur-2xl transition-all group-hover:bg-gold/10" />

              {/* Avatar + Names */}
              <div className={`mb-6 flex flex-col gap-5 sm:flex-row sm:items-start ${language === 'ur' ? 'sm:flex-row-reverse text-right' : ''}`}>
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald to-emerald-deep font-display text-2xl font-bold text-cream shadow-lg shadow-emerald/30">
                  {getInitials(leader.name)}
                </div>

                <div className={`flex flex-col gap-1 ${language === 'ur' ? 'font-urdu text-right' : 'font-display text-left'}`}>
                  <h3 className={`${language === 'ur' ? 'text-xl font-bold leading-[1.8]' : 'text-2xl font-semibold'} text-emerald-deep`}>
                    {leader.name}
                  </h3>
                  <p className={`${language === 'ur' ? 'text-sm font-semibold leading-[1.8]' : 'text-sm font-semibold uppercase tracking-wider'} text-gold`}>
                    {leader.title}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div className={`${language === 'ur' ? 'font-urdu text-right' : 'text-left'}`}>
                <p className={`text-emerald/80 ${language === 'ur' ? 'text-sm leading-[2.1] sm:text-[0.9rem]' : 'text-sm leading-relaxed md:text-base'}`}>
                  {leader.bio}
                </p>
              </div>

              {/* Focus tags */}
              <div className={`mt-6 flex flex-wrap gap-2 ${language === 'ur' ? 'flex-row-reverse' : ''}`}>
                {leader.focus.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full border border-emerald/15 bg-emerald/5 px-3 py-1 text-[11px] font-semibold text-emerald-deep"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
