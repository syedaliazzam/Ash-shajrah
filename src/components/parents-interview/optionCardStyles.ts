/**
 * Shared visual system for Parents Interview Form selectable option cards.
 * Use these helpers for Yes/No, ratings, and other radio-card groups.
 */
export const interviewOptionCardBaseClass =
  "flex min-h-11 w-full items-center justify-center rounded-xl border px-4 py-3 text-center text-sm leading-snug transition duration-200 sm:text-base";

export const interviewOptionCardUnselectedClass =
  "border-emerald-900/15 bg-[#fffdf7] font-medium text-emerald-deep shadow-none hover:border-emerald/35 hover:bg-cream hover:shadow-sm";

export const interviewOptionCardSelectedClass =
  "border-gold bg-emerald-deep font-semibold text-white shadow-[0_8px_20px_-6px_rgba(13,59,46,0.45),0_0_0_1px_rgba(201,162,39,0.55)]";

export const interviewOptionCardFocusClass =
  "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-gold peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#fffdf7]";

export function interviewOptionCardClass(selected: boolean): string {
  return [
    interviewOptionCardBaseClass,
    interviewOptionCardFocusClass,
    selected
      ? interviewOptionCardSelectedClass
      : interviewOptionCardUnselectedClass,
  ].join(" ");
}
