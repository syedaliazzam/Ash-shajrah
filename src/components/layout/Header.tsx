"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useLanguage } from "@/contexts/LanguageContext";
import { REGISTER_URL, WHATSAPP_URL } from "@/lib/constants";
import { NAV_ITEMS } from "@/lib/nav";

const navLinkClass =
  "min-h-[44px] whitespace-nowrap text-[11px] font-medium text-emerald-deep/85 transition-colors hover:text-emerald xl:text-xs 2xl:text-sm";

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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 w-full max-w-full transition-all duration-500 ${
        scrolled
          ? "border-b border-emerald/15 bg-cream/90 py-2 shadow-md shadow-emerald-deep/10 backdrop-blur-xl sm:py-2.5"
          : "border-b border-white/10 bg-cream/55 py-2.5 shadow-sm shadow-emerald-deep/5 backdrop-blur-md sm:py-3"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group shrink-0 transition-opacity hover:opacity-90">
          <BrandLogo variant="header" priority />
        </Link>

        <nav className="hidden items-center gap-2.5 xl:flex 2xl:gap-4">
          {NAV_ITEMS.map((item) => (
            <Link key={item.key} href={item.href} className={navLinkClass}>
              {t.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center xl:flex">
          <Link
            href={REGISTER_URL}
            className="inline-flex min-h-[44px] items-center rounded-full bg-emerald px-4 py-2 text-xs font-semibold text-cream shadow-md shadow-emerald/20 transition-all hover:bg-emerald-light hover:shadow-emerald/30 2xl:px-5 2xl:py-2.5 2xl:text-sm"
          >
            {t.nav.enroll}
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1.5 xl:hidden"
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
        <nav className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-emerald/10 bg-cream/95 px-4 py-6 shadow-lg backdrop-blur-xl sm:px-6 xl:hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex min-h-[48px] items-center rounded-xl px-3 text-base font-medium text-emerald-deep transition hover:bg-emerald/5 ${language === "ur" ? "font-urdu justify-end text-right" : ""}`}
              >
                {t.nav[item.key]}
              </Link>
            ))}

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className={`mt-4 flex min-h-[48px] items-center justify-center rounded-full border border-emerald/20 bg-emerald/5 px-5 py-3 text-center text-sm font-semibold text-emerald-deep ${language === "ur" ? "font-urdu" : ""}`}
            >
              {language === "ur" ? "واٹس ایپ" : "WhatsApp"}
            </a>
            <Link
              href={REGISTER_URL}
              onClick={() => setMenuOpen(false)}
              className={`flex min-h-[48px] items-center justify-center rounded-full bg-emerald px-5 py-3 text-center text-sm font-semibold text-cream ${language === "ur" ? "font-urdu" : ""}`}
            >
              {t.nav.enroll}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
