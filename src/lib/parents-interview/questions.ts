export type ParentInterviewQuestionType =
  | "select"
  | "short_text"
  | "yes_no"
  | "yes_no_details"
  | "development_ages"
  | "time"
  | "screen_time"
  | "textarea"
  | "behaviour_group";

export type ParentInterviewQuestion = {
  id: string;
  number: string;
  label: string;
  type: ParentInterviewQuestionType;
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  detailLabel?: string;
  detailPlaceholder?: string;
  detailRequiredWhen?: "yes" | "fair_or_poor";
  minLength?: number;
  subquestions?: ParentInterviewQuestion[];
};

export type ParentInterviewSection = {
  id: string;
  title: string;
  description?: string;
  questions: ParentInterviewQuestion[];
};

/**
 * External LMS response contract (formVersion 2)
 *
 * responses JSONB shape:
 * {
 *   formVersion: 2,
 *   answers: {
 *     q1: "first",
 *     q2: { answer: "yes"|"no", details?: string },
 *     q3: { rating: "excellent"|"good"|"fair"|"poor", details?: string },
 *     q8: { sat, crawled, walked },
 *     q20_1..q20_4: { answer, details? },
 *     q28: { duration: string, supervised: boolean },
 *     q29: string,
 *     ...
 *   }
 * }
 *
 * Stable IDs: q1–q29 plus q20_1–q20_4.
 * Render labels/sections from parentInterviewSections in this file.
 */
export const PARENT_INTERVIEW_FORM_VERSION = 2;

export const BIRTH_ORDER_OPTIONS = [
  { value: "first", label: "First child" },
  { value: "second", label: "Second child" },
  { value: "third", label: "Third child" },
  { value: "fourth", label: "Fourth child" },
  { value: "fifth_or_later", label: "Fifth child or later" },
] as const;

export const HEALTH_RATING_OPTIONS = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
] as const;

export const SCREEN_DURATION_OPTIONS = [
  { value: "less_than_30_minutes", label: "Less than 30 minutes" },
  { value: "30_minutes_to_1_hour", label: "30 minutes to 1 hour" },
  { value: "1_to_2_hours", label: "1 to 2 hours" },
  { value: "2_to_3_hours", label: "2 to 3 hours" },
  { value: "more_than_3_hours", label: "More than 3 hours" },
] as const;

export const parentInterviewSections: ParentInterviewSection[] = [
  {
    id: "birth-and-health",
    title: "Birth and Health Information",
    questions: [
      {
        id: "q1",
        number: "1",
        label: "What is your child’s birth order?",
        type: "select",
        required: true,
        options: [...BIRTH_ORDER_OPTIONS],
      },
      {
        id: "q2",
        number: "2",
        label: "Were there any complications during your child’s birth?",
        type: "yes_no_details",
        required: true,
        detailRequiredWhen: "yes",
        detailLabel: "Please briefly describe the complications.",
        detailPlaceholder: "Please briefly describe the complications.",
      },
      {
        id: "q3",
        number: "3",
        label: "How would you describe your child’s overall health?",
        type: "select",
        required: true,
        options: [...HEALTH_RATING_OPTIONS],
        detailRequiredWhen: "fair_or_poor",
        detailLabel: "Please briefly tell us about your health concerns.",
        detailPlaceholder: "Please briefly tell us about your health concerns.",
      },
      {
        id: "q4",
        number: "4",
        label:
          "Does your child have a serious medical condition, allergy, or need ongoing treatment?",
        type: "yes_no_details",
        required: true,
        detailRequiredWhen: "yes",
        detailLabel: "Please describe the condition, allergy, or treatment.",
        detailPlaceholder:
          "Please describe the condition, allergy, or treatment.",
      },
      {
        id: "q5",
        number: "5",
        label: "Is your child currently taking any medication?",
        type: "yes_no_details",
        required: true,
        detailRequiredWhen: "yes",
        detailLabel:
          "Please provide the medication name and why it is being taken.",
        detailPlaceholder:
          "Please provide the medication name and why it is being taken.",
      },
      {
        id: "q6",
        number: "6",
        label: "Have you ever had concerns about your child’s vision or hearing?",
        type: "yes_no_details",
        required: true,
        detailRequiredWhen: "yes",
        detailLabel: "Please briefly describe your concern.",
        detailPlaceholder: "Please briefly describe your concern.",
      },
      {
        id: "q7",
        number: "7",
        label:
          "Has your child ever had a medical, developmental, or psychological assessment?",
        type: "yes_no_details",
        required: true,
        detailRequiredWhen: "yes",
        detailLabel:
          "Please tell us what type of assessment was completed and share any important findings.",
        detailPlaceholder:
          "Please tell us what type of assessment was completed and share any important findings.",
      },
    ],
  },
  {
    id: "early-developmental-milestones",
    title: "Early Developmental Milestones",
    questions: [
      {
        id: "q8",
        number: "8",
        label:
          "At what age did your child sit independently, crawl, and begin walking?",
        type: "development_ages",
        required: true,
        placeholder: "For example: 6 months",
      },
      {
        id: "q9",
        number: "9",
        label: "At what age did your child say their first word?",
        type: "short_text",
        required: true,
        placeholder: "For example: 12 months",
      },
      {
        id: "q10",
        number: "10",
        label: "At what age did your child begin speaking in sentences?",
        type: "short_text",
        required: true,
        placeholder: "For example: 2 years",
      },
      {
        id: "q11",
        number: "11",
        label: "What language or languages are spoken at home?",
        type: "short_text",
        required: true,
        placeholder: "For example: Urdu and English",
      },
      {
        id: "q12",
        number: "12",
        label: "Can your child clearly communicate their basic needs?",
        type: "yes_no",
        required: true,
      },
    ],
  },
  {
    id: "readiness-and-learning-skills",
    title: "Readiness and Learning Skills",
    questions: [
      {
        id: "q13",
        number: "13",
        label: "Can your child hold a pencil or crayon comfortably?",
        type: "yes_no",
        required: true,
      },
      {
        id: "q14",
        number: "14",
        label:
          "Can your child recognise some colours, shapes, letters, or numbers?",
        type: "yes_no",
        required: true,
      },
      {
        id: "q15",
        number: "15",
        label: "Can your child follow simple instructions?",
        type: "yes_no",
        required: true,
      },
      {
        id: "q16",
        number: "16",
        label:
          "Can your child stay focused on one activity for about 5 to 10 minutes?",
        type: "yes_no",
        required: true,
      },
      {
        id: "q17",
        number: "17",
        label:
          "Has your child attended a school, daycare, or learning programme before?",
        type: "yes_no_details",
        required: true,
        detailRequiredWhen: "yes",
        detailLabel:
          "Please provide the name or type of programme and how long your child attended.",
        detailPlaceholder:
          "Please provide the name or type of programme and how long your child attended.",
      },
    ],
  },
  {
    id: "social-and-emotional-development",
    title: "Social and Emotional Development",
    questions: [
      {
        id: "q18",
        number: "18",
        label:
          "Does your child usually interact comfortably with other children?",
        type: "yes_no",
        required: true,
      },
      {
        id: "q19",
        number: "19",
        label:
          "Does your child find it difficult to separate from a parent or caregiver?",
        type: "yes_no_details",
        required: true,
        detailRequiredWhen: "yes",
        detailLabel:
          "Please briefly describe how your child usually responds during separation.",
        detailPlaceholder:
          "Please briefly describe how your child usually responds during separation.",
      },
      {
        id: "q20",
        number: "20",
        label: "Does your child experience any of the following?",
        type: "behaviour_group",
        required: true,
        subquestions: [
          {
            id: "q20_1",
            number: "20.1",
            label: "Bedwetting",
            type: "yes_no",
            required: true,
          },
          {
            id: "q20_2",
            number: "20.2",
            label:
              "Fears that seem unusual or stronger than expected for their age",
            type: "yes_no_details",
            required: true,
            detailRequiredWhen: "yes",
            detailLabel: "Please briefly describe the fear.",
            detailPlaceholder: "Please briefly describe the fear.",
          },
          {
            id: "q20_3",
            number: "20.3",
            label: "Frequent anger or stubborn behaviour",
            type: "yes_no_details",
            required: true,
            detailRequiredWhen: "yes",
            detailLabel: "Please briefly describe when this usually happens.",
            detailPlaceholder:
              "Please briefly describe when this usually happens.",
          },
          {
            id: "q20_4",
            number: "20.4",
            label: "Anxiety, restlessness, or noticeable mood changes",
            type: "yes_no_details",
            required: true,
            detailRequiredWhen: "yes",
            detailLabel: "Please briefly describe what you have noticed.",
            detailPlaceholder: "Please briefly describe what you have noticed.",
          },
        ],
      },
      {
        id: "q21",
        number: "21",
        label:
          "How does your child usually respond when you correct or guide them?",
        type: "textarea",
        required: true,
        placeholder: "Please describe your child’s usual response.",
      },
      {
        id: "q22",
        number: "22",
        label: "How do you usually manage your child’s behaviour at home?",
        type: "textarea",
        required: true,
        placeholder:
          "Please briefly describe the approaches that work for your family.",
      },
    ],
  },
  {
    id: "physical-activities-and-daily-routine",
    title: "Physical Activities and Daily Routine",
    questions: [
      {
        id: "q23",
        number: "23",
        label: "Does your child regularly play outdoors?",
        type: "yes_no",
        required: true,
      },
      {
        id: "q24",
        number: "24",
        label: "Can your child ride a bicycle or tricycle?",
        type: "yes_no",
        required: true,
      },
      {
        id: "q25",
        number: "25",
        label: "What is your child’s usual bedtime?",
        type: "time",
        required: true,
      },
      {
        id: "q26",
        number: "26",
        label: "Does your child usually take an afternoon nap?",
        type: "yes_no",
        required: true,
      },
    ],
  },
  {
    id: "interests-and-screen-time",
    title: "Interests and Screen Time",
    questions: [
      {
        id: "q27",
        number: "27",
        label: "What activities and toys does your child enjoy most?",
        type: "textarea",
        required: true,
        placeholder:
          "For example: drawing, building blocks, storybooks, puzzles, or outdoor games",
      },
      {
        id: "q28",
        number: "28",
        label:
          "On average, how much time does your child spend using screens or watching television each day?",
        type: "screen_time",
        required: true,
        options: [...SCREEN_DURATION_OPTIONS],
      },
    ],
  },
  {
    id: "parent-expectations",
    title: "Parent Expectations",
    questions: [
      {
        id: "q29",
        number: "29",
        label:
          "Why would you like your child to join Ash-Shajrah Learning Hub’s online learning programme, and what do you hope your child will learn or develop?",
        type: "textarea",
        required: true,
        minLength: 20,
        placeholder: "Please share your expectations in a few sentences.",
      },
    ],
  },
];

export function getAllAnswerableQuestions(): ParentInterviewQuestion[] {
  const list: ParentInterviewQuestion[] = [];
  for (const section of parentInterviewSections) {
    for (const q of section.questions) {
      if (q.type === "behaviour_group" && q.subquestions) {
        list.push(...q.subquestions);
      } else {
        list.push(q);
      }
    }
  }
  return list;
}

export const allParentInterviewQuestions = getAllAnswerableQuestions();
