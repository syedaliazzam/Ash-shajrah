"use client";

import { RadioCardGroup } from "@/components/parents-interview/RadioCardGroup";

type Props = {
  questionId: string;
  number: string;
  label: string;
  answer?: string;
  details?: string;
  detailLabel?: string;
  detailPlaceholder?: string;
  showDetails?: boolean;
  error?: string;
  detailsError?: string;
  onAnswerChange: (answer: "yes" | "no") => void;
  onDetailsChange: (details: string) => void;
  fieldsetRef?: (el: HTMLElement | null) => void;
};

const YES_NO_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

export function YesNoDetailQuestion({
  questionId,
  number,
  label,
  answer,
  details,
  detailLabel,
  detailPlaceholder,
  showDetails = false,
  error,
  detailsError,
  onAnswerChange,
  onDetailsChange,
  fieldsetRef,
}: Props) {
  const errorId = `${questionId}-error`;
  const detailsErrorId = `${questionId}-details-error`;

  return (
    <fieldset
      ref={fieldsetRef}
      className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm"
      aria-invalid={error || detailsError ? true : undefined}
      aria-describedby={
        error || detailsError
          ? [error ? errorId : null, detailsError ? detailsErrorId : null]
              .filter(Boolean)
              .join(" ")
          : undefined
      }
    >
      <legend className="w-full text-base font-semibold leading-7 text-emerald-950">
        {number}. {label}
      </legend>

      <div className="mt-4">
        <RadioCardGroup
          name={`${questionId}.answer`}
          options={YES_NO_OPTIONS}
          value={answer}
          onChange={(next) => onAnswerChange(next as "yes" | "no")}
          columns={2}
        />
      </div>

      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {showDetails && (
        <div className="mt-4">
          <label
            htmlFor={`${questionId}-details`}
            className="block text-sm font-semibold text-emerald-950"
          >
            {detailLabel || "Please provide the requested details."}
          </label>
          <textarea
            id={`${questionId}-details`}
            name={`${questionId}.details`}
            rows={4}
            required
            value={details || ""}
            onChange={(e) => onDetailsChange(e.target.value)}
            placeholder={detailPlaceholder}
            className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 text-base leading-7 text-emerald-950 outline-none transition placeholder:text-emerald-950/40 focus:border-gold focus:ring-2 focus:ring-gold/30"
          />
          {detailsError && (
            <p id={detailsErrorId} className="mt-2 text-sm text-red-600">
              {detailsError}
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}
