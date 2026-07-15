"use client";

import type { ReactNode, Ref } from "react";

type Props = {
  number: string;
  label: string;
  children: ReactNode;
  className?: string;
  errorIds?: string;
  invalid?: boolean;
  fieldsetRef?:
    | Ref<HTMLFieldSetElement>
    | ((el: HTMLFieldSetElement | null) => void);
};

/** Compact question card: content-height, no legend border gap. */
export const questionCardClassName =
  "min-w-0 rounded-[24px] border border-emerald-900/10 bg-white px-4 pb-5 pt-4 shadow-sm sm:px-6 sm:pb-6 sm:pt-5";

export const questionHeadingClassName =
  "text-lg font-semibold leading-7 text-emerald-950 sm:text-xl";

export function QuestionCard({
  number,
  label,
  children,
  className = "",
  errorIds,
  invalid,
  fieldsetRef,
}: Props) {
  return (
    <fieldset
      ref={fieldsetRef}
      className={`${questionCardClassName} ${className}`.trim()}
      aria-invalid={invalid ? true : undefined}
      aria-describedby={errorIds}
    >
      <legend className="sr-only">
        {number}. {label}
      </legend>
      <div className={questionHeadingClassName}>
        <span className="mr-1">{number}.</span>
        <span>{label}</span>
      </div>
      {children}
    </fieldset>
  );
}
