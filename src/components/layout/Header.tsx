"use client";



import { useState, useEffect } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useLanguage } from "@/contexts/LanguageContext";
import { REGISTER_URL, WHATSAPP_URL } from "@/lib/constants";

export function Header() {
  const { t, language } = useLanguage();

  const [menuOpen, setMenuOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);



  useEffect(() => {

    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);

  }, []);



  return (

    <header

      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled

          ? "border-b border-emerald/15 bg-cream/90 py-2.5 shadow-md shadow-emerald-deep/10 backdrop-blur-xl sm:py-3"

          : "border-b border-white/10 bg-cream/55 py-3.5 shadow-sm shadow-emerald-deep/5 backdrop-blur-md sm:py-4"

        }`}

    >

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="group shrink-0 transition-opacity hover:opacity-90">
          <BrandLogo variant="header" priority />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/#about" className="text-sm font-medium text-emerald-deep/85 transition-colors hover:text-emerald">{t.nav.about}</Link>
          <Link href="/#programs" className="text-sm font-medium text-emerald-deep/85 transition-colors hover:text-emerald">{t.nav.programs}</Link>
          <Link href="/#curriculum" className="text-sm font-medium text-emerald-deep/85 transition-colors hover:text-emerald">{t.nav.curriculum}</Link>
          <Link href="/#learning-approach" className="text-sm font-medium text-emerald-deep/85 transition-colors hover:text-emerald">{t.nav.learningApproach}</Link>
          <Link href="/#how-it-works" className="text-sm font-medium text-emerald-deep/85 transition-colors hover:text-emerald">{t.nav.howItWorks}</Link>
          <Link href="/#values" className="text-sm font-medium text-emerald-deep/85 transition-colors hover:text-emerald">{t.nav.values}</Link>
          <Link href="/#leadership" className="text-sm font-medium text-emerald-deep/85 transition-colors hover:text-emerald">{t.nav.leadership}</Link>
          <Link href="/#footer" className="text-sm font-medium text-emerald-deep/85 transition-colors hover:text-emerald">{t.nav.contact}</Link>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href={REGISTER_URL}
            className="rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-cream shadow-md shadow-emerald/20 transition-all hover:bg-emerald-light hover:shadow-emerald/30"
          >
            {t.nav.enroll}
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span
            className={`block h-0.5 w-6 bg-emerald-deep transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-emerald-deep transition-opacity ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-emerald-deep transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-emerald/10 bg-cream/95 px-6 py-6 shadow-lg backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/#about" onClick={() => setMenuOpen(false)} className="text-base font-medium text-emerald-deep">{t.nav.about}</Link>
            <Link href="/#programs" onClick={() => setMenuOpen(false)} className="text-base font-medium text-emerald-deep">{t.nav.programs}</Link>
            <Link href="/#curriculum" onClick={() => setMenuOpen(false)} className="text-base font-medium text-emerald-deep">{t.nav.curriculum}</Link>
            <Link href="/#learning-approach" onClick={() => setMenuOpen(false)} className="text-base font-medium text-emerald-deep">{t.nav.learningApproach}</Link>
            <Link href="/#how-it-works" onClick={() => setMenuOpen(false)} className="text-base font-medium text-emerald-deep">{t.nav.howItWorks}</Link>
            <Link href="/#values" onClick={() => setMenuOpen(false)} className="text-base font-medium text-emerald-deep">{t.nav.values}</Link>
            <Link href="/#leadership" onClick={() => setMenuOpen(false)} className="text-base font-medium text-emerald-deep">{t.nav.leadership}</Link>
            <Link href="/#footer" onClick={() => setMenuOpen(false)} className="text-base font-medium text-emerald-deep">{t.nav.contact}</Link>


            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="mt-4 flex items-center justify-center rounded-full border border-emerald/20 bg-emerald/5 px-5 py-3 text-center text-sm font-semibold text-emerald-deep"
            >
              {language === "ur" ? "واٹس ایپ" : "WhatsApp"}
            </a>
            <Link
              href={REGISTER_URL}
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-full bg-emerald px-5 py-3 text-center text-sm font-semibold text-cream"
            >
              {t.nav.enroll}
            </Link>
          </div>
        </nav>
      )}

    </header>

  );

}

