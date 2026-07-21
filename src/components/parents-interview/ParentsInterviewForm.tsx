"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  BIRTH_ORDER_OPTIONS,
  HEALTH_RATING_OPTIONS,
  PARENT_INTERVIEW_FORM_VERSION,
  SCREEN_DURATION_OPTIONS,
  parentInterviewSections,
  type ParentInterviewQuestion,
} from "@/lib/parents-interview/questions";
import {
  buildPayloadFromFormState,
  validateParentInterviewSection,
  type ParentInterviewFormState,
} from "@/lib/parents-interview/validation";
import type { ParentInterviewPublicMeta } from "@/lib/parents-interview/db";
import { YesNoDetailQuestion } from "@/components/parents-interview/YesNoDetailQuestion";
import { RadioCardGroup } from "@/components/parents-interview/RadioCardGroup";
import { QuestionCard } from "@/components/parents-interview/QuestionCard";

type Props = {
  token: string;
  initialMeta: ParentInterviewPublicMeta;
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 text-base text-emerald-950 outline-none transition placeholder:text-emerald-950/40 focus:border-gold focus:ring-2 focus:ring-gold/30";

const inputClassFlush =
  "w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 text-base text-emerald-950 outline-none transition placeholder:text-emerald-950/40 focus:border-gold focus:ring-2 focus:ring-gold/30";

const textareaClass =
  "mt-2 min-h-28 w-full resize-y rounded-2xl border border-emerald-900/15 bg-white px-4 py-4 text-base leading-7 text-emerald-950 outline-none transition placeholder:text-emerald-950/40 focus:border-gold focus:ring-2 focus:ring-gold/30";

const textareaClassFlush =
  "min-h-28 w-full resize-y rounded-2xl border border-emerald-900/15 bg-white px-4 py-4 text-base leading-7 text-emerald-950 outline-none transition placeholder:text-emerald-950/40 focus:border-gold focus:ring-2 focus:ring-gold/30";

export function ParentsInterviewForm({ token, initialMeta }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ParentInterviewFormState>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const alreadySubmitted = initialMeta.status !== "pending";
  const firstErrorRef = useRef<HTMLElement | null>(null);

  const section = parentInterviewSections[step];
  const isLast = step === parentInterviewSections.length - 1;
  const totalSteps = parentInterviewSections.length;

  const summaryItems = useMemo(() => {
    return [
      { label: "Parent Name", value: initialMeta.parentName },
      { label: "Parent Email", value: initialMeta.parentEmail },
      { label: "Child Name", value: initialMeta.childName },
      { label: "Child Date of Birth", value: initialMeta.childAge },
      {
        label: "Interested Programme",
        value: initialMeta.interestedProgramme,
      },
    ].filter((item) => Boolean(item.value?.trim()));
  }, [initialMeta]);

  useEffect(() => {
    if (Object.keys(fieldErrors).length === 0) return;
    firstErrorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [fieldErrors, step]);

  function patchAnswer(
    questionId: string,
    patch: ParentInterviewFormState[string],
    clearDetails = false
  ) {
    setAnswers((prev) => {
      const current = { ...(prev[questionId] || {}) };
      const next = { ...current, ...patch };
      if (clearDetails) next.details = "";
      return { ...prev, [questionId]: next };
    });
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[questionId];
      delete next[`${questionId}.details`];
      delete next[`${questionId}.sat`];
      delete next[`${questionId}.crawled`];
      delete next[`${questionId}.walked`];
      return next;
    });
  }

  function validateCurrentStep(): boolean {
    const errors = validateParentInterviewSection(step, answers);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError("Please answer every item in this section.");
      return false;
    }
    setFormError(null);
    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  function goPrev() {
    setFormError(null);
    setFieldErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateCurrentStep() || submitting) return;

    setSubmitting(true);
    setFormError(null);

    try {
      const payloadAnswers = buildPayloadFromFormState(answers);
      const res = await fetch(`/api/parents-interview/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: {
            formVersion: PARENT_INTERVIEW_FORM_VERSION,
            answers: payloadAnswers,
          },
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!res.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setFormError(
          data.error ||
            "Something went wrong while submitting the form. Please try again or contact us on WhatsApp."
        );
        return;
      }

      setSuccess(true);
    } catch {
      setFormError(
        "Something went wrong while submitting the form. Please try again or contact us on WhatsApp."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function isFirstError(keys: string[]) {
    const first = Object.keys(fieldErrors)[0];
    return Boolean(
      first && keys.some((k) => first === k || first.startsWith(`${k}.`))
    );
  }

  function renderYesNo(
    question: ParentInterviewQuestion,
    withDetails: boolean
  ) {
    const value = answers[question.id] || {};
    const showDetails = withDetails && value.answer === "yes";
    return (
      <YesNoDetailQuestion
        key={question.id}
        questionId={question.id}
        number={question.number}
        label={question.label}
        answer={value.answer}
        details={value.details}
        detailLabel={question.detailLabel}
        detailPlaceholder={question.detailPlaceholder}
        showDetails={showDetails}
        error={fieldErrors[question.id]}
        detailsError={fieldErrors[`${question.id}.details`]}
        fieldsetRef={
          isFirstError([question.id])
            ? (el: HTMLElement | null) => {
                firstErrorRef.current = el;
              }
            : undefined
        }
        onAnswerChange={(answer) =>
          patchAnswer(question.id, { answer }, answer === "no")
        }
        onDetailsChange={(details) => patchAnswer(question.id, { details })}
      />
    );
  }

  function renderQuestion(question: ParentInterviewQuestion) {
    const value = answers[question.id] || {};

    if (question.type === "yes_no") {
      return renderYesNo(question, false);
    }
    if (question.type === "yes_no_details") {
      return renderYesNo(question, true);
    }

    if (question.type === "behaviour_group" && question.subquestions) {
      return (
        <div
          key={question.id}
          className="min-w-0 rounded-[24px] border border-emerald-900/10 bg-white px-4 pb-5 pt-4 shadow-sm sm:px-6 sm:pb-6 sm:pt-5"
        >
          <h4 className="text-lg font-semibold leading-7 text-emerald-950 sm:text-xl">
            <span className="mr-1">{question.number}.</span>
            <span>{question.label}</span>
          </h4>
          <div className="mt-4 space-y-4">
            {question.subquestions.map((sub) =>
              renderYesNo(sub, sub.type === "yes_no_details")
            )}
          </div>
        </div>
      );
    }

    if (question.type === "development_ages") {
      const fields = [
        { key: "sat" as const, label: "Sat independently" },
        { key: "crawled" as const, label: "Started crawling" },
        { key: "walked" as const, label: "Started walking" },
      ];
      return (
        <QuestionCard
          key={question.id}
          number={question.number}
          label={question.label}
          fieldsetRef={
            isFirstError([
              `${question.id}.sat`,
              `${question.id}.crawled`,
              `${question.id}.walked`,
            ])
              ? (el: HTMLElement | null) => {
                  firstErrorRef.current = el;
                }
              : undefined
          }
        >
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {fields.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={`${question.id}-${field.key}`}
                  className="block text-sm font-semibold text-emerald-950"
                >
                  {field.label}
                </label>
                <input
                  id={`${question.id}-${field.key}`}
                  type="text"
                  value={value[field.key] || ""}
                  placeholder={question.placeholder}
                  onChange={(e) =>
                    patchAnswer(question.id, { [field.key]: e.target.value })
                  }
                  className={inputClass}
                />
                {fieldErrors[`${question.id}.${field.key}`] && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors[`${question.id}.${field.key}`]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </QuestionCard>
      );
    }

    if (question.type === "select" && question.id === "q3") {
      const rating = value.rating || value.answer || "";
      const showDetails = rating === "fair" || rating === "poor";
      return (
        <QuestionCard
          key={question.id}
          number={question.number}
          label={question.label}
          fieldsetRef={
            isFirstError([question.id])
              ? (el: HTMLElement | null) => {
                  firstErrorRef.current = el;
                }
              : undefined
          }
        >
          <div className="mt-4">
            <RadioCardGroup
              name={`${question.id}.rating`}
              options={HEALTH_RATING_OPTIONS}
              value={rating}
              onChange={(next) => {
                patchAnswer(
                  question.id,
                  { rating: next, answer: next },
                  next !== "fair" && next !== "poor"
                );
              }}
              columns={2}
            />
          </div>
          {fieldErrors[question.id] && (
            <p className="mt-2 text-sm text-red-600">{fieldErrors[question.id]}</p>
          )}
          {showDetails && (
            <div className="mt-4">
              <label className="block text-sm font-semibold text-emerald-950">
                {question.detailLabel}
              </label>
              <textarea
                rows={4}
                value={value.details || ""}
                placeholder={question.detailPlaceholder}
                onChange={(e) =>
                  patchAnswer(question.id, { details: e.target.value })
                }
                className={textareaClass}
              />
              {fieldErrors[`${question.id}.details`] && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldErrors[`${question.id}.details`]}
                </p>
              )}
            </div>
          )}
        </QuestionCard>
      );
    }

    if (question.type === "select") {
      const selectOptions = question.options || BIRTH_ORDER_OPTIONS;
      return (
        <QuestionCard
          key={question.id}
          number={question.number}
          label={question.label}
          fieldsetRef={
            isFirstError([question.id])
              ? (el: HTMLElement | null) => {
                  firstErrorRef.current = el;
                }
              : undefined
          }
        >
          <div className="mt-4">
            <RadioCardGroup
              name={`${question.id}.answer`}
              options={selectOptions}
              value={value.answer || ""}
              onChange={(next) =>
                patchAnswer(question.id, { answer: next })
              }
              columns={selectOptions.length > 4 ? 3 : 2}
            />
          </div>
          {fieldErrors[question.id] && (
            <p className="mt-2 text-sm text-red-600">{fieldErrors[question.id]}</p>
          )}
        </QuestionCard>
      );
    }

    if (question.type === "screen_time") {
      return (
        <QuestionCard
          key={question.id}
          number={question.number}
          label={question.label}
          fieldsetRef={
            isFirstError([question.id])
              ? (el: HTMLElement | null) => {
                  firstErrorRef.current = el;
                }
              : undefined
          }
        >
          <div className="mt-4">
            <RadioCardGroup
              name={`${question.id}.duration`}
              options={SCREEN_DURATION_OPTIONS}
              value={value.duration || ""}
              onChange={(next) =>
                patchAnswer(question.id, { duration: next })
              }
              columns={2}
            />
          </div>
          {fieldErrors[question.id] && (
            <p className="mt-2 text-sm text-red-600">{fieldErrors[question.id]}</p>
          )}
          <label
            className={`mt-4 flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
              value.supervised
                ? "border-[#d4af37] bg-emerald-800 shadow-md"
                : "border-emerald-900/15 bg-[#fffdf7] hover:border-emerald-700/40 hover:bg-emerald-50"
            }`}
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2"
              checked={Boolean(value.supervised)}
              onChange={(e) =>
                patchAnswer(question.id, { supervised: e.target.checked })
              }
            />
            <span
              className={`text-sm leading-6 sm:text-base ${
                value.supervised
                  ? "font-semibold text-white"
                  : "font-medium text-emerald-950"
              }`}
            >
              Screen time is usually supervised by an adult
            </span>
          </label>
        </QuestionCard>
      );
    }

    if (question.type === "time") {
      return (
        <QuestionCard
          key={question.id}
          number={question.number}
          label={question.label}
          fieldsetRef={
            isFirstError([question.id])
              ? (el: HTMLElement | null) => {
                  firstErrorRef.current = el;
                }
              : undefined
          }
        >
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`${question.id}-time`}
                className="block text-sm font-semibold text-emerald-950"
              >
                Bedtime
              </label>
              <input
                id={`${question.id}-time`}
                type="time"
                value={
                  /^\d{2}:\d{2}$/.test(value.answer || "") ? value.answer : ""
                }
                onChange={(e) =>
                  patchAnswer(question.id, { answer: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor={`${question.id}-text`}
                className="block text-sm font-semibold text-emerald-950"
              >
                Or type bedtime
              </label>
              <input
                id={`${question.id}-text`}
                type="text"
                placeholder="For example: 8:30 PM"
                value={value.answer || ""}
                onChange={(e) =>
                  patchAnswer(question.id, { answer: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>
          {value.answer && (
            <p className="mt-3 text-sm text-emerald-950/70">
              Selected bedtime: <strong>{value.answer}</strong>
            </p>
          )}
          {fieldErrors[question.id] && (
            <p className="mt-2 text-sm text-red-600">{fieldErrors[question.id]}</p>
          )}
        </QuestionCard>
      );
    }

    if (question.type === "short_text") {
      return (
        <QuestionCard
          key={question.id}
          number={question.number}
          label={question.label}
          fieldsetRef={
            isFirstError([question.id])
              ? (el: HTMLElement | null) => {
                  firstErrorRef.current = el;
                }
              : undefined
          }
        >
          <div className="mt-4">
            <input
              type="text"
              value={value.answer || ""}
              placeholder={question.placeholder}
              onChange={(e) =>
                patchAnswer(question.id, { answer: e.target.value })
              }
              className={inputClassFlush}
            />
          </div>
          {fieldErrors[question.id] && (
            <p className="mt-2 text-sm text-red-600">{fieldErrors[question.id]}</p>
          )}
        </QuestionCard>
      );
    }

    const min = question.minLength ?? 0;
    const text = value.answer || "";
    return (
      <QuestionCard
        key={question.id}
        number={question.number}
        label={question.label}
        fieldsetRef={
          isFirstError([question.id])
            ? (el: HTMLElement | null) => {
                firstErrorRef.current = el;
              }
            : undefined
        }
      >
        <div className="mt-4">
          <textarea
            rows={min > 0 ? 7 : 4}
            value={text}
            placeholder={question.placeholder}
            onChange={(e) =>
              patchAnswer(question.id, { answer: e.target.value })
            }
            className={
              min > 0
                ? "min-h-40 w-full resize-y rounded-2xl border border-emerald-900/15 bg-white px-4 py-4 text-base leading-7 text-emerald-950 outline-none transition placeholder:text-emerald-950/40 focus:border-gold focus:ring-2 focus:ring-gold/30"
                : textareaClassFlush
            }
          />
        </div>
        {min > 0 && (
          <p className="mt-2 text-xs text-emerald-950/55">
            {text.trim().length} characters (minimum {min})
          </p>
        )}
        {fieldErrors[question.id] && (
          <p className="mt-2 text-sm text-red-600">{fieldErrors[question.id]}</p>
        )}
      </QuestionCard>
    );
  }

  if (alreadySubmitted) {
    return (
      <div
        dir="ltr"
        lang="en"
        className="rounded-[28px] border border-emerald-900/10 bg-[#fffdf7] p-5 shadow-xl sm:p-7 lg:p-10"
      >
        <h2 className="font-display text-2xl font-bold text-emerald-950">
          Form already submitted
        </h2>
        <p className="mt-3 text-base leading-7 text-emerald-950/80">
          This Parents Interview Form has already been submitted. Thank you for
          sharing this information with us.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div
        dir="ltr"
        lang="en"
        className="rounded-[28px] border border-emerald-900/10 bg-[#fffdf7] p-5 shadow-xl sm:p-7 lg:p-10"
      >
        <h2 className="font-display text-2xl font-bold text-emerald-950">
          Thank you
        </h2>
        <p className="mt-3 text-base leading-7 text-emerald-950/80">
          Thank you. Your Parents Interview Form has been submitted
          successfully. Our admission team will review your responses and
          contact you shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      dir="ltr"
      lang="en"
      onSubmit={onSubmit}
      className="rounded-[28px] border border-emerald-900/10 bg-[#fffdf7] p-5 shadow-xl sm:p-7 lg:p-10"
      noValidate
    >
      <div className="rounded-2xl border border-gold/25 bg-cream/70 p-5 sm:p-6">
        <h2 className="font-display text-xl font-bold text-emerald-950 sm:text-2xl">
          Why we are asking you to complete this form
        </h2>
        <p className="mt-3 text-sm leading-7 text-emerald-950/80 sm:text-base">
          Every child is different. This form helps the Ash-Shajrah Learning Hub
          admission and academic team understand your child’s health, early
          development, learning readiness, daily routine, behaviour, interests,
          and home environment.
        </p>
        <p className="mt-3 text-sm leading-7 text-emerald-950/80 sm:text-base">
          Your answers will help us prepare for the next stage of admission and
          provide learning support that is appropriate for your child’s age and
          individual needs.
        </p>
        <p className="mt-3 text-sm leading-7 text-emerald-950/80 sm:text-base">
          This is not a test, and there are no right or wrong answers. Please
          share honest information so we can understand how to support your
          child in a caring and practical way.
        </p>
        <p className="mt-4 rounded-xl border border-emerald-900/10 bg-white/70 px-4 py-3 text-sm leading-6 text-emerald-950/75">
          Your responses will only be used by the Ash-Shajrah Learning Hub
          admission and academic team for admission review, child onboarding,
          parent guidance, and learning support.
        </p>
      </div>

      {summaryItems.length > 0 && (
        <div className="mt-6 rounded-2xl border border-emerald-900/10 bg-white p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-950/60">
            Registration summary
          </h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {summaryItems.map((item) => (
              <div key={item.label}>
                <dt className="text-xs font-semibold text-emerald-950/50">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm font-medium text-emerald-950">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="mt-8">
        <p
          className="text-sm font-semibold text-emerald-950/70"
          aria-live="polite"
        >
          Step {step + 1} of {totalSteps}
        </p>
        <h3 className="mt-1 font-display text-xl font-bold text-emerald-950 sm:text-2xl">
          Section {step + 1}: {section.title}
        </h3>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-emerald-900/10">
          <div
            className="h-full rounded-full bg-emerald transition-all"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {section.questions.map((question) => renderQuestion(question))}
      </div>

      {formError && (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={step === 0 || submitting}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-emerald-900/15 bg-white px-6 py-3 text-sm font-semibold text-emerald-950 disabled:opacity-40"
        >
          Previous
        </button>

        {isLast ? (
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-cream disabled:opacity-60 sm:w-auto"
          >
            {submitting ? "Submitting…" : "Submit Form"}
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            disabled={submitting}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-cream disabled:opacity-60"
          >
            Continue
          </button>
        )}
      </div>
    </form>
  );
}
