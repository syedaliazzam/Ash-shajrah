"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { BrandLogo } from "@/components/ui/BrandLogo";

const NAV = [
  { href: "/lms", key: "dashboard" as const },
  { href: "/lms/careers", key: "careers" as const },
  { href: "/lms/admin/careers", key: "adminCareers" as const },
];

export function LmsShell({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const isUrdu = language === "ur";
  const l = t.lms;

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-emerald-deep">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-emerald/10 bg-white lg:w-64 lg:border-b-0 lg:border-e lg:border-emerald/10">
          <div className="flex items-center justify-between gap-3 px-5 py-4 lg:flex-col lg:items-stretch lg:py-6">
            <Link href="/lms" className="flex items-center gap-3">
              <BrandLogo variant="header" className="h-10 w-auto" />
            </Link>
            <div className="flex items-center gap-2 lg:mt-4">
              <button
                type="button"
                onClick={() => setLanguage(language === "en" ? "ur" : "en")}
                className="rounded-full border border-emerald/15 px-3 py-1.5 text-xs font-semibold"
              >
                {language === "en" ? "اردو" : "EN"}
              </button>
              <Link
                href="/"
                className={`rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-emerald-deep ${isUrdu ? "font-urdu" : ""}`}
              >
                {l.backToSite}
              </Link>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:overflow-visible lg:px-3">
            {NAV.map((item) => {
              const active =
                item.href === "/lms"
                  ? pathname === "/lms"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-emerald text-cream"
                      : "text-emerald-deep/70 hover:bg-cream"
                  } ${isUrdu ? "font-urdu" : ""}`}
                >
                  {l.nav[item.key]}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
