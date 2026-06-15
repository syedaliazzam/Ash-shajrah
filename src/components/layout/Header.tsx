"use client";



import { useState, useEffect } from "react";

import { NAV_LINKS } from "@/lib/data";

import { BrandLogo } from "@/components/ui/BrandLogo";



export function Header() {

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

      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${

        scrolled

          ? "border-b border-emerald/15 bg-cream/90 py-2.5 shadow-md shadow-emerald-deep/10 backdrop-blur-xl sm:py-3"

          : "border-b border-white/10 bg-cream/55 py-3.5 shadow-sm shadow-emerald-deep/5 backdrop-blur-md sm:py-4"

      }`}

    >

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">

        <a href="#" className="group shrink-0 transition-opacity hover:opacity-90">

          <BrandLogo variant="header" priority />

        </a>



        <nav className="hidden items-center gap-8 md:flex">

          {NAV_LINKS.map((link) => (

            <a

              key={link.href}

              href={link.href}

              className="text-sm font-medium text-emerald-deep/85 transition-colors hover:text-emerald"

            >

              {link.label}

            </a>

          ))}

        </nav>



        <a

          href="#contact"

          className="hidden rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-cream shadow-md shadow-emerald/20 transition-all hover:bg-emerald-light hover:shadow-emerald/30 md:inline-flex"

        >

          Enroll

        </a>



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

            {NAV_LINKS.map((link) => (

              <a

                key={link.href}

                href={link.href}

                onClick={() => setMenuOpen(false)}

                className="text-base font-medium text-emerald-deep"

              >

                {link.label}

              </a>

            ))}

            <a

              href="#contact"

              onClick={() => setMenuOpen(false)}

              className="mt-2 rounded-full bg-emerald px-5 py-3 text-center text-sm font-semibold text-cream"

            >

              Enroll

            </a>

          </div>

        </nav>

      )}

    </header>

  );

}

