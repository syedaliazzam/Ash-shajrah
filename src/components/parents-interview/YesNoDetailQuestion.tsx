"use client";

import { QuestionCard } from "@/components/parents-interview/QuestionCard";
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
  const describedBy = [error ? errorId : null, detailsError ? detailsErrorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <QuestionCard
      number={number}
      label={label}
      invalid={Boolean(error || detailsError)}
      errorIds={describedBy || undefined}
      fieldsetRef={fieldsetRef}
    >
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
    </QuestionCard>
  );
}
