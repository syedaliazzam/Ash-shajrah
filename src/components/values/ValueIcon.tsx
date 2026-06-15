"use client";

import type { ReactNode } from "react";

type ValueIconProps = {
  title: string;
  className?: string;
};

const ICONS: Record<string, ReactNode> = {
  Knowledge: (
    <>
      <path d="M12 4v16M8 8h8M7 20h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M9 12c0-2 1.5-3 3-3s3 1 3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  Respect: (
    <>
      <path d="M12 21s-6-4.5-6-10a4 4 0 0 1 7-2.5A4 4 0 0 1 20 11c0 5.5-6 10-6 10z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </>
  ),
  Integrity: (
    <>
      <path d="M12 3l7 3v6c0 5-3.5 8.5-7 9.5C8.5 20.5 5 17 5 12V6l7-3z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M9.5 12l1.8 1.8L15 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  Focus: (
    <>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  Compassion: (
    <>
      <path d="M8 11c0-2 1.5-3.5 4-3.5S16 9 16 11c0 3.5-4 6-4 6s-4-2.5-4-6z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M6 8c-1.5 0-2.5 1-2.5 2.2C3.5 13 6 15 6 15M18 8c1.5 0 2.5 1 2.5 2.2C20.5 13 18 15 18 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  Creativity: (
    <>
      <path d="M12 3l1.2 4.2L17 8l-3.8 1.2L12 14l-1.2-4.8L7 8l3.8-0.8L12 3z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M5 18l1 2M19 18l-1 2M12 18v3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  Teamwork: (
    <>
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="15" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M5 19c0-2.5 2-4.5 4-4.5M19 19c0-2.5-2-4.5-4-4.5M12 19c0-2.5-1.5-4.5-3-4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  "Growth Mindset": (
    <>
      <path d="M12 20V10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M12 10c-3-2-6-1-6 2s3 4 6 2M12 10c3-2 6-1 6 2s-3 4-6 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6V4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  Discipline: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 2v4M15 2v4M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  Leadership: (
    <>
      <path d="M12 4l2 5h5l-4 3.5 1.5 5.5L12 15l-4.5 3 1.5-5.5L5 9h5L12 4z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </>
  ),
};

export function ValueIcon({ title, className = "" }: ValueIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      {ICONS[title] ?? ICONS.Knowledge}
    </svg>
  );
}
