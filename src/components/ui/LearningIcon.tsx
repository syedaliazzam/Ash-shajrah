import type { ReactNode } from "react";

type IconName = (typeof import("@/lib/data").LEARNING_PILLARS)[number]["icon"];

const paths: Record<string, ReactNode> = {
  "early-years": (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1"
    />
  ),
  montessori: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14M8 17h8M8 13h8M8 9h5"
    />
  ),
  character: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21s-6-4.35-6-10a6 6 0 1112 0c0 5.65-6 10-6 10z"
    />
  ),
  creative: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z"
    />
  ),
  confidence: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.8 5.7 21l2.3-7-6-4.6h7.6L12 2z" />
  ),
  teacher: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v10H4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 20h8M12 16v4" />
    </>
  ),
  parent: (
    <>
      <circle cx="9" cy="8" r="2.5" />
      <circle cx="16" cy="8" r="2" />
      <path strokeLinecap="round" d="M4 18c0-2.5 2.2-4 5-4s5 1.5 5 4" />
      <path strokeLinecap="round" d="M14 14c1.8 0 3.5.8 3.5 4" />
    </>
  ),
  leadership: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 20V10l6-4 6 4v10M6 20h12M10 20v-4h4v4"
    />
  ),
  connect: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8M4 6h16v12H4z" />
  ),
  guidance: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7l7-4z" />
  ),
  sessions: (
    <>
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path strokeLinecap="round" d="M8 21h8M12 17v4" />
    </>
  ),
  progress: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 18V6h16v12M8 14l3-3 3 2 4-5" />
  ),
};

export function LearningIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden
    >
      {paths[name] ?? paths["early-years"]}
    </svg>
  );
}

export type { IconName };
