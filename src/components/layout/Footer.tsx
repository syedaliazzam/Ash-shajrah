"use client";

import { SITE } from "@/lib/data";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Footer() {
  return (
    <footer className="relative border-t border-emerald/10 bg-emerald-deep px-6 py-16 text-cream lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(45,138,106,0.15),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-lg shadow-black/10">
              <BrandLogo variant="footer" />
            </div>
            <p className="max-w-xs text-center text-sm text-cream/70 md:text-left">
              {SITE.tagline}
            </p>
          </div>

          <p className="font-display text-lg tracking-widest text-gold-soft">
            {SITE.footerPhrase}
          </p>
        </div>

        <div className="mt-12 border-t border-cream/10 pt-8 text-center text-sm text-cream/50">
          <p>
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
