"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/data";

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      scrollReveal("[data-contact-item]", {
        trigger: sectionRef.current,
        start: "top 80%",
        stagger: 0.1,
        y: 30,
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative px-6 py-24 lg:px-8 lg:py-32"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-emerald/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.06),transparent_60%)]" />

      <div className="relative mx-auto max-w-4xl text-center">
        <h2
          data-contact-item
          className="font-display text-4xl font-semibold text-emerald-deep md:text-5xl"
        >
          Start Your Online Learning Journey
        </h2>

        <p
          data-contact-item
          className="mx-auto mt-6 max-w-2xl text-lg text-emerald"
        >
          Connect with Ash-Shajrah Learning Hub to explore online programs, book a consultation,
          and receive personalized guidance for your child&apos;s learning path.
        </p>

        <div
          data-contact-item
          className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
        >
          <Button href="#contact" variant="primary" className="w-full">
            Book an Online Consultation
          </Button>
          <Button href={SITE.contact.whatsapp} variant="secondary" className="w-full">
            Contact on WhatsApp
          </Button>
          <Button href={`mailto:${SITE.contact.email}?subject=Program%20Details`} variant="outline" className="w-full">
            Request Program Details
          </Button>
          <Button href={SITE.contact.whatsapp} variant="primary" className="w-full !bg-emerald-deep hover:!bg-emerald">
            Start Online Learning Journey
          </Button>
        </div>

        <div
          data-contact-item
          className="glass-card mx-auto mt-14 max-w-md p-8 text-left"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-emerald/60">
            Connect With Us Online
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald/50">
                WhatsApp
              </p>
              <a
                href={SITE.contact.whatsapp}
                className="mt-1 block text-emerald-deep transition-colors hover:text-emerald"
              >
                Message us on WhatsApp
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald/50">
                Phone
              </p>
              <a
                href={`tel:${SITE.contact.phone.replace(/\s/g, "")}`}
                className="mt-1 block text-emerald-deep transition-colors hover:text-emerald"
              >
                {SITE.contact.phone}
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald/50">
                Email
              </p>
              <a
                href={`mailto:${SITE.contact.email}`}
                className="mt-1 block text-emerald-deep transition-colors hover:text-emerald"
              >
                {SITE.contact.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
