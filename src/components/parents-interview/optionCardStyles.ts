/**
 * Shared visual system for Parents Interview Form selectable option cards.
 * Use these helpers for Yes/No, ratings, and other radio-card groups.
 */
export const interviewOptionCardBaseClass =
  "flex min-h-14 w-full items-center justify-center rounded-2xl border px-4 py-3 text-center text-base font-semibold leading-6 transition duration-200 sm:text-lg";

export const interviewOptionCardUnselectedClass =
  "border-emerald-900/15 bg-[#fffdf7] text-emerald-950 hover:border-emerald-700/40 hover:bg-emerald-50";

export const interviewOptionCardSelectedClass =
  "border-[#d4af37] bg-emerald-800 text-white shadow-md";

export const interviewOptionCardFocusClass =
  "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#d4af37] peer-focus-visible:ring-offset-2";

export function interviewOptionCardClass(selected: boolean): string {
  return [
    interviewOptionCardBaseClass,
    interviewOptionCardFocusClass,
    selected
      ? interviewOptionCardSelectedClass
      : interviewOptionCardUnselectedClass,
  ].join(" ");
}
