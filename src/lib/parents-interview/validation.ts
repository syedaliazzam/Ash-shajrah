import { createHash, randomBytes } from "crypto";
import {
  HEALTH_RATING_OPTIONS,
  PARENT_INTERVIEW_FORM_VERSION,
  SCREEN_DURATION_OPTIONS,
  getAllAnswerableQuestions,
  parentInterviewSections,
  type ParentInterviewQuestion,
} from "@/lib/parents-interview/questions";

export type YesNoDetailAnswer = {
  answer: "yes" | "no";
  details?: string;
};

export type HealthRatingAnswer = {
  rating: string;
  details?: string;
};

export type DevelopmentAgesAnswer = {
  sat: string;
  crawled: string;
  walked: string;
};

export type ScreenTimeAnswer = {
  duration: string;
  supervised: boolean;
};

/** Per-question answer values stored under responses.answers */
export type ParentInterviewAnswerValue =
  | string
  | YesNoDetailAnswer
  | HealthRatingAnswer
  | DevelopmentAgesAnswer
  | ScreenTimeAnswer;

export type ParentInterviewAnswers = Record<string, ParentInterviewAnswerValue>;

/** Versioned JSONB payload saved to parent_interview_forms.responses */
export type ParentInterviewResponsePayload = {
  formVersion: number;
  answers: ParentInterviewAnswers;
};

/** Local form state before packaging for submit */
export type ParentInterviewFormState = Record<
  string,
  {
    answer?: string;
    details?: string;
    rating?: string;
    sat?: string;
    crawled?: string;
    walked?: string;
    duration?: string;
    supervised?: boolean;
  }
>;

export function createParentInterviewRawToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashParentInterviewToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function buildParentInterviewUrl(rawToken: string): string {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://ashshajrah.com"
  ).replace(/\/$/, "");
  return `${siteUrl}/parents-interview/${rawToken}`;
}

function asObject(
  value: unknown
): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function validateOneQuestion(
  question: ParentInterviewQuestion,
  raw: unknown,
  fieldErrors: Record<string, string>
): ParentInterviewAnswerValue | null {
  if (question.type === "select") {
    if (question.id === "q3") {
      const obj = asObject(raw);
      const rating =
        typeof obj?.rating === "string"
          ? obj.rating
          : typeof raw === "string"
            ? raw
            : "";
      const allowed = HEALTH_RATING_OPTIONS.map((o) => o.value);
      if (!rating || !allowed.includes(rating as (typeof allowed)[number])) {
        fieldErrors[question.id] = "Please select an answer.";
        return null;
      }
      const needsDetails = rating === "fair" || rating === "poor";
      const details =
        typeof obj?.details === "string" ? obj.details.trim() : "";
      if (needsDetails && !details) {
        fieldErrors[`${question.id}.details`] =
          "Please provide the requested details.";
        return null;
      }
      return needsDetails ? { rating, details } : { rating, details: "" };
    }

    const value = typeof raw === "string" ? raw : "";
    const allowed = (question.options || []).map((o) => o.value);
    if (!value || !allowed.includes(value)) {
      fieldErrors[question.id] = "Please select an answer.";
      return null;
    }
    return value;
  }

  if (question.type === "yes_no" || question.type === "yes_no_details") {
    const obj = asObject(raw);
    const answer = obj?.answer;
    if (answer !== "yes" && answer !== "no") {
      fieldErrors[question.id] = "Please select an answer.";
      return null;
    }
    if (
      question.type === "yes_no_details" &&
      question.detailRequiredWhen === "yes" &&
      answer === "yes"
    ) {
      const details =
        typeof obj?.details === "string" ? obj.details.trim() : "";
      if (!details) {
        fieldErrors[`${question.id}.details`] =
          "Please provide the requested details.";
        return null;
      }
      return { answer, details };
    }
    return { answer };
  }

  if (question.type === "development_ages") {
    const obj = asObject(raw);
    const sat = typeof obj?.sat === "string" ? obj.sat.trim() : "";
    const crawled =
      typeof obj?.crawled === "string" ? obj.crawled.trim() : "";
    const walked = typeof obj?.walked === "string" ? obj.walked.trim() : "";
    if (!sat) fieldErrors[`${question.id}.sat`] = "Please complete this field.";
    if (!crawled)
      fieldErrors[`${question.id}.crawled`] = "Please complete this field.";
    if (!walked)
      fieldErrors[`${question.id}.walked`] = "Please complete this field.";
    if (!sat || !crawled || !walked) return null;
    return { sat, crawled, walked };
  }

  if (question.type === "short_text" || question.type === "time") {
    const answer =
      typeof raw === "string"
        ? raw.trim()
        : typeof asObject(raw)?.answer === "string"
          ? String(asObject(raw)!.answer).trim()
          : "";
    if (!answer) {
      fieldErrors[question.id] = "Please complete this field.";
      return null;
    }
    return answer;
  }

  if (question.type === "screen_time") {
    const obj = asObject(raw);
    const duration =
      typeof obj?.duration === "string" ? obj.duration : "";
    const allowed = SCREEN_DURATION_OPTIONS.map((o) => o.value);
    if (!duration || !allowed.includes(duration as (typeof allowed)[number])) {
      fieldErrors[question.id] = "Please select an answer.";
      return null;
    }
    return {
      duration,
      supervised: Boolean(obj?.supervised),
    };
  }

  if (question.type === "textarea") {
    const answer =
      typeof raw === "string"
        ? raw.trim()
        : typeof asObject(raw)?.answer === "string"
          ? String(asObject(raw)!.answer).trim()
          : "";
    if (!answer) {
      fieldErrors[question.id] = "Please complete this field.";
      return null;
    }
    const min = question.minLength ?? 0;
    if (min > 0 && answer.length < min) {
      fieldErrors[question.id] = "Please write at least 20 characters.";
      return null;
    }
    return answer;
  }

  fieldErrors[question.id] = "Please select an answer.";
  return null;
}

/** Convert UI form state into the versioned payload shape. */
export function buildPayloadFromFormState(
  state: ParentInterviewFormState
): ParentInterviewAnswers {
  const answers: ParentInterviewAnswers = {};
  for (const question of getAllAnswerableQuestions()) {
    const value = state[question.id];
    if (!value) continue;

    if (question.type === "select" && question.id === "q3") {
      answers[question.id] = {
        rating: value.rating || value.answer || "",
        details: value.details || "",
      };
      continue;
    }
    if (question.type === "select") {
      if (value.answer) answers[question.id] = value.answer;
      continue;
    }
    if (question.type === "yes_no" || question.type === "yes_no_details") {
      if (value.answer === "yes" || value.answer === "no") {
        answers[question.id] =
          value.answer === "yes" && value.details
            ? { answer: value.answer, details: value.details }
            : { answer: value.answer };
      }
      continue;
    }
    if (question.type === "development_ages") {
      answers[question.id] = {
        sat: value.sat || "",
        crawled: value.crawled || "",
        walked: value.walked || "",
      };
      continue;
    }
    if (question.type === "screen_time") {
      answers[question.id] = {
        duration: value.duration || "",
        supervised: Boolean(value.supervised),
      };
      continue;
    }
    if (
      question.type === "short_text" ||
      question.type === "time" ||
      question.type === "textarea"
    ) {
      if (value.answer) answers[question.id] = value.answer;
    }
  }
  return answers;
}

export function validateParentInterviewResponses(
  input: unknown
):
  | { ok: true; payload: ParentInterviewResponsePayload }
  | { ok: false; error: string; fieldErrors: Record<string, string> } {
  const root = asObject(input);
  const answersRaw = root?.answers ?? input;
  const answersObj = asObject(answersRaw);

  if (!answersObj) {
    return {
      ok: false,
      error: "Please answer every item in this section.",
      fieldErrors: {},
    };
  }

  const fieldErrors: Record<string, string> = {};
  const answers: ParentInterviewAnswers = {};
  const answerable = getAllAnswerableQuestions();
  const knownIds = new Set(answerable.map((q) => q.id));

  for (const key of Object.keys(answersObj)) {
    if (!knownIds.has(key)) {
      fieldErrors[key] = "Unknown question.";
    }
  }

  for (const question of answerable) {
    const result = validateOneQuestion(
      question,
      answersObj[question.id],
      fieldErrors
    );
    if (result !== null) answers[question.id] = result;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: "Please review the highlighted questions.",
      fieldErrors,
    };
  }

  if (Object.keys(answers).length !== answerable.length) {
    return {
      ok: false,
      error: "Please answer every item in this section.",
      fieldErrors,
    };
  }

  return {
    ok: true,
    payload: {
      formVersion: PARENT_INTERVIEW_FORM_VERSION,
      answers,
    },
  };
}

export function validateParentInterviewSection(
  sectionIndex: number,
  state: ParentInterviewFormState
): Record<string, string> {
  const section = parentInterviewSections[sectionIndex];
  const fieldErrors: Record<string, string> = {};
  if (!section) return fieldErrors;

  const built = buildPayloadFromFormState(state);

  for (const question of section.questions) {
    if (question.type === "behaviour_group" && question.subquestions) {
      for (const sub of question.subquestions) {
        validateOneQuestion(sub, built[sub.id], fieldErrors);
      }
    } else {
      validateOneQuestion(question, built[question.id], fieldErrors);
    }
  }

  return fieldErrors;
}
