"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { AdmissionForm } from "@/components/sections/AdmissionForm";
import { useLanguage } from "@/contexts/LanguageContext";

export function ContactSection() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      scrollReveal("[data-contact-item]", {
        trigger: sectionRef.current,
        start: "top 82%",
        stagger: 0.12,
        y: 35,
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative overflow-hidden px-6 py-24 lg:px-8 lg:py-32"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream-dark/20 to-emerald/[0.04]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(201,162,39,0.08),transparent_55%)]" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#0d3b2e 1px, transparent 1px), linear-gradient(90deg, #0d3b2e 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-4xl">
        <div data-contact-item className={`text-center mb-16 ${language === 'ur' ? 'font-urdu' : ''}`}>
          <span className="mb-4 inline-block rounded-full border border-emerald/20 bg-emerald/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald">
            {t.nav.contact}
          </span>
          <h2 className={`mb-4 text-3xl font-bold text-emerald-deep sm:text-4xl ${language === 'ur' ? 'leading-[1.8]' : 'font-display'}`}>
            {t.contact.title}
          </h2>
          <p className={`mx-auto max-w-3xl text-emerald-deep/80 sm:text-lg ${language === 'ur' ? 'leading-[2.2]' : 'leading-relaxed'}`}>
            {t.contact.subtitle}
          </p>
        </div>





        {/* Admission Form */}
        <div data-contact-item>
          <AdmissionForm />
        </div>
      </div>
    </section>
  );
}
