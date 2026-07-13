"use client";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { FacebookIcon } from "@/components/ui/FacebookIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { ASH_SHAJRAH_FACEBOOK_URL, WHATSAPP_URL } from "@/lib/constants";

function ContactRow({
  label,
  value,
  href,
  language,
  dir = "auto",
}: {
  label: string;
  value: string;
  href?: string;
  language: string;
  dir?: "auto" | "ltr" | "rtl";
}) {
  return (
    <div>
      <p className={`${language === 'ur' ? 'font-urdu' : 'uppercase tracking-wider'} text-[11px] font-semibold text-gold-soft/75`}>
        {label}
      </p>
      {href ? (
        <a
          href={href}
          dir={dir}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className={`mt-1 block break-words text-sm font-medium leading-snug text-cream transition-colors hover:text-gold-soft ${language === 'ur' ? 'text-right font-sans' : 'text-left'}`}
        >
          {value}
        </a>
      ) : (
        <p
          dir={dir}
          className={`mt-1 block break-words text-sm font-medium leading-snug text-cream ${language === 'ur' ? 'text-right font-sans' : 'text-left'}`}
        >
          {value}
        </p>
      )}
    </div>
  );
}

export function Footer() {
  const { t, language } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="scroll-mt-28 relative overflow-hidden border-t border-emerald/10 bg-emerald-deep px-5 py-10 text-cream sm:px-6 lg:px-8 lg:py-12">
      {/* Background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_30%,rgba(45,138,106,0.2),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_60%,rgba(201,162,39,0.1),transparent_50%)]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#faf7f0 1px, transparent 1px), linear-gradient(90deg, #faf7f0 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="pointer-events-none absolute right-8 top-1/2 hidden h-40 w-40 -translate-y-1/2 opacity-[0.04] lg:block"
        aria-hidden
      >
        <svg viewBox="0 0 480 520" className="h-full w-full" fill="none">
          <g stroke="#faf7f0" strokeWidth="1.5" strokeLinecap="round">
            <path d="M228 400 L228 290 Q240 280 252 290 L252 400" />
            <ellipse cx="240" cy="200" rx="90" ry="78" />
            <path d="M80 400 Q240 420 400 400 L390 435 Q240 418 90 435 Z" />
          </g>
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-2 md:gap-x-10 lg:grid-cols-[1.1fr_1fr_1fr] lg:gap-x-0">
          {/* Left — logo & tagline */}
          <div className={`flex flex-col items-center text-center ${language === 'ur' ? 'md:items-end md:text-right lg:pl-8' : 'md:items-start md:text-left lg:pr-8'}`}>
            <a
              href="#"
              className="footer-logo-shell shrink-0 transition-transform duration-300 hover:scale-[1.02]"
            >
              <BrandLogo variant="footer" />
            </a>

            {/* Phrase */}
            <div className="mt-4">
              <p className={`${language === 'ur' ? 'font-urdu' : 'font-display tracking-wide'} text-base text-gold-soft`}>
                {t.footer.phrase}
              </p>
            </div>

            <p className={`${language === 'ur' ? 'font-urdu leading-[2.1]' : 'leading-relaxed'} mt-3 max-w-[260px] text-sm text-cream/60`}>
              {t.footer.brandName}
            </p>
            <p className={`${language === 'ur' ? 'font-urdu leading-[2.1]' : 'leading-relaxed'} mt-2 max-w-[240px] text-sm text-cream/60`}>
              {t.footer.support}
            </p>
          </div>

          {/* Middle — contact */}
          <div className={`border-cream/10 md:border-t-0 lg:border-l ${language === 'ur' ? 'lg:pr-8 lg:border-r lg:border-l-0' : 'lg:pl-8 lg:pr-8'}`}>
            <h2
              className={`mb-5 text-lg font-semibold text-gold-soft sm:text-xl ${language === 'ur' ? 'font-urdu text-right' : 'font-display tracking-wide text-left'}`}
            >
              {t.nav.contact}
            </h2>
            <div
              dir={language === 'ur' ? 'rtl' : 'ltr'}
              className={`flex flex-col space-y-5 ${language === 'ur' ? 'items-end text-right' : 'items-start text-left'}`}
            >
              <ContactRow
                label={t.footer.contact.whatsapp}
                value={t.footer.contact.whatsappValue}
                href={WHATSAPP_URL}
                language={language}
                dir="ltr"
              />
              <ContactRow
                label={t.footer.contact.email}
                value={t.footer.contact.emailValue}
                href={`mailto:${t.footer.contact.emailValue}`}
                language={language}
                dir="ltr"
              />
              <ContactRow
                label={t.footer.contact.office}
                value={t.footer.contact.officeValue}
                language={language}
                dir={language === 'ur' ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          {/* Right — CTA */}
          <div className={`flex flex-col items-center border-cream/10 text-center md:col-span-2 md:items-center lg:col-span-1 lg:border-l ${language === 'ur' ? 'lg:border-r lg:border-l-0 lg:pr-8 lg:items-end lg:text-right' : 'lg:items-start lg:pl-8 lg:text-left'}`}>
            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-6 rounded-full bg-gold/10 blur-2xl"
                aria-hidden
              />
              <p className={`relative ${language === 'ur' ? 'font-urdu' : 'font-display tracking-wide'} text-xl text-gold-soft sm:text-[1.35rem]`}>
                {t.footer.brandName}
              </p>
            </div>
            <p className={`${language === 'ur' ? 'font-urdu' : ''} mt-2 max-w-xs text-sm leading-relaxed text-cream/70`}>
              {t.footer.description}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center rounded-full border border-gold/35 bg-gold/15 px-5 py-2.5 text-sm font-semibold text-cream transition-all duration-300 hover:border-gold/55 hover:bg-gold/25 hover:text-gold-soft ${language === 'ur' ? 'font-urdu' : ''}`}
              >
                {t.footer.messageUs}
              </a>
              {ASH_SHAJRAH_FACEBOOK_URL && (
                <a
                  href={ASH_SHAJRAH_FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t.brand.facebookAriaLabel}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/35 bg-gold/15 text-cream transition-all duration-300 hover:border-gold/55 hover:bg-gold/25 hover:text-gold-soft"
                >
                  <FacebookIcon />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={`mt-8 flex flex-col items-center justify-between gap-2 border-t border-cream/10 pt-5 text-xs text-cream/45 sm:flex-row sm:gap-4 ${language === 'ur' ? 'flex-row-reverse font-urdu text-[0.8rem]' : ''}`}>
          <p className={language === 'ur' ? 'font-sans' : ''}>
            &copy; {year} {t.footer.brandName}
          </p>
          <p>{t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
