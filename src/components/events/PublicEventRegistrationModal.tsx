"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  formatEventDate,
  formatEventFee,
  formatEventTime,
  hasRegistrationDeadlinePassed,
  type EventRegistrationField,
  type PublicEvent,
} from "@/lib/public-events";
import {
  getPhoneLocalDigitsForCode,
  PHONE_COUNTRY_CODES,
} from "@/lib/registration-options";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  event: PublicEvent;
  open: boolean;
  onClose: () => void;
};

type FormState = {
  participantName: string;
  email: string;
  whatsapp: string;
  notes: string;
  studentName?: string;
  parentName?: string;
  schoolName?: string;
  classInput?: string;
  studentNames?: string[];
};

type FormErrors = Partial<Record<keyof FormState | string, string>>;

const INITIAL_FORM: FormState = {
  participantName: "",
  email: "",
  whatsapp: "",
  notes: "",
  studentName: "",
  parentName: "",
  schoolName: "",
  classInput: "",
  studentNames: [""],
};

function buildDynamicValuesForFields(fields: EventRegistrationField[]) {
  return fields.reduce<Record<string, string | string[]>>((nextValues, field) => {
    nextValues[field.id] = field.type === "multiple_student_names" ? [""] : "";
    return nextValues;
  }, {});
}

function extractApiError(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.error === "string" && record.error.trim()) return record.error;
    if (typeof record.message === "string" && record.message.trim()) return record.message;
  }
  return fallback;
}

function extractRegistrationNumber(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  const candidates = [record.registrationNumber, record.registration_number];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function extractSubmittedCustomFields(payload: unknown) {
  if (!payload || typeof payload !== "object") return [];
  const values = (payload as { customFieldDisplayValues?: unknown }).customFieldDisplayValues;
  if (!Array.isArray(values)) return [];

  return values
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const label = String(record.label ?? "").trim();
      const rawValue = record.value;
      const value = Array.isArray(rawValue)
        ? rawValue.map((entry) => String(entry ?? "").trim()).filter(Boolean)
        : String(rawValue ?? "").trim();
      if (!label) return null;
      return { label, value };
    })
    .filter((item): item is { label: string; value: string | string[] } => Boolean(item));
}

function isValidName(value: string) {
  return /^[a-zA-Z]+(?:[a-zA-Z\s'.-]*[a-zA-Z])?$/.test(value.trim());
}

function getCountryFlagForOption(label: string, fallbackFlag?: string) {
  if (fallbackFlag) return fallbackFlag;

  const countryName = label.replace(/\s*\(\+\d+\)\s*$/, "").trim();
  const countryToIso: Record<string, string> = {
    Afghanistan: "AF", Albania: "AL", Algeria: "DZ", Andorra: "AD", Angola: "AO",
    Argentina: "AR", Armenia: "AM", Australia: "AU", Austria: "AT", Azerbaijan: "AZ",
    Bahrain: "BH", Bangladesh: "BD", Belarus: "BY", Belgium: "BE", Belize: "BZ",
    Benin: "BJ", Bhutan: "BT", Bolivia: "BO", "Bosnia and Herzegovina": "BA", Botswana: "BW",
    Brazil: "BR", Brunei: "BN", Bulgaria: "BG", "Burkina Faso": "BF", Burundi: "BI",
    Cambodia: "KH", Cameroon: "CM", Canada: "CA", "Cape Verde": "CV", "Central African Republic": "CF",
    Chad: "TD", Chile: "CL", China: "CN", Colombia: "CO", Comoros: "KM",
    Congo: "CG", "Congo DR": "CD", "Costa Rica": "CR", Croatia: "HR", Cuba: "CU",
    Cyprus: "CY", "Czech Republic": "CZ", Denmark: "DK", Djibouti: "DJ", Ecuador: "EC",
    Egypt: "EG", "El Salvador": "SV", "Equatorial Guinea": "GQ", Eritrea: "ER", Estonia: "EE",
    Ethiopia: "ET", Fiji: "FJ", Finland: "FI", France: "FR", Gabon: "GA",
    Gambia: "GM", Georgia: "GE", Germany: "DE", Ghana: "GH", Greece: "GR",
    Guatemala: "GT", Guinea: "GN", "Guinea-Bissau": "GW", Guyana: "GY", Haiti: "HT",
    Honduras: "HN", Hungary: "HU", Iceland: "IS", India: "IN", Indonesia: "ID",
    Iran: "IR", Iraq: "IQ", Ireland: "IE", Israel: "IL", Italy: "IT",
    "Ivory Coast": "CI", Japan: "JP", Jordan: "JO", Kazakhstan: "KZ", Kenya: "KE",
    Kuwait: "KW", Kyrgyzstan: "KG", Laos: "LA", Latvia: "LV", Lebanon: "LB",
    Lesotho: "LS", Liberia: "LR", Libya: "LY", Liechtenstein: "LI", Lithuania: "LT",
    Luxembourg: "LU", Madagascar: "MG", Malawi: "MW", Malaysia: "MY", Maldives: "MV",
    Mali: "ML", Malta: "MT", Mauritania: "MR", Mauritius: "MU", Mexico: "MX",
    Moldova: "MD", Monaco: "MC", Mongolia: "MN", Montenegro: "ME", Morocco: "MA",
    Mozambique: "MZ", Myanmar: "MM", Namibia: "NA", Nepal: "NP", Netherlands: "NL",
    "New Zealand": "NZ", Nicaragua: "NI", Niger: "NE", Nigeria: "NG", "North Macedonia": "MK",
    Norway: "NO", Oman: "OM", Pakistan: "PK", Panama: "PA", Paraguay: "PY",
    Peru: "PE", Philippines: "PH", Poland: "PL", Portugal: "PT", Qatar: "QA",
    Romania: "RO", Russia: "RU", Rwanda: "RW", "Saudi Arabia": "SA", Senegal: "SN",
    Serbia: "RS", "Sierra Leone": "SL", Singapore: "SG", Slovakia: "SK", Slovenia: "SI",
    Somalia: "SO", "South Africa": "ZA", "South Korea": "KR", "South Sudan": "SS", Spain: "ES",
    "Sri Lanka": "LK", Sudan: "SD", Suriname: "SR", Sweden: "SE", Switzerland: "CH",
    Syria: "SY", Taiwan: "TW", Tajikistan: "TJ", Tanzania: "TZ", Thailand: "TH",
    Togo: "TG", Tunisia: "TN", Turkey: "TR", Turkmenistan: "TM", Uganda: "UG",
    Ukraine: "UA", UAE: "AE", "United Kingdom": "GB", "United States": "US", Uruguay: "UY",
    Uzbekistan: "UZ", Venezuela: "VE", Vietnam: "VN", Yemen: "YE", Zambia: "ZM", Zimbabwe: "ZW",
  };

  const iso = countryToIso[countryName];
  if (!iso) return "🌍";

  return iso
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

export function PublicEventRegistrationModal({ event, open, onClose }: Props) {
  const { language } = useLanguage();
  const isUrdu = language === "ur";
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [liveEvent, setLiveEvent] = useState<PublicEvent | null>(null);
  const [dynamicValues, setDynamicValues] = useState<Record<string, string | string[]>>({});
  const [countryCode, setCountryCode] = useState("+92");
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [localNumber, setLocalNumber] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{
    registrationNumber: string;
    message: string;
    requiresPayment: boolean;
    customFieldValues: Array<{ label: string; value: string | string[] }>;
  } | null>(null);
  const countryMenuRef = useRef<HTMLDivElement | null>(null);
  const labelClassName = "mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-emerald-deep/90";
  const activeEvent = liveEvent?.id === event.id ? liveEvent : event;
  const configuredFields = activeEvent.registrationFormSchema || [];
  const hasConfiguredFields = configuredFields.length > 0;

  const localDigits = getPhoneLocalDigitsForCode(countryCode);
  const selectedCountry = PHONE_COUNTRY_CODES.find((option) => option.code === countryCode) || PHONE_COUNTRY_CODES[0];
  const selectedCountryFlag = getCountryFlagForOption(selectedCountry.label, (selectedCountry as { flag?: string }).flag);

  const uiText = {
    close: isUrdu ? "بند کریں" : "Close",
    reserveSeat: isUrdu ? "اپنی نشست محفوظ کریں" : "Reserve your seat",
    reserveSeatBody: isUrdu ? "نیچے فارم مکمل کریں۔" : "Complete the form below.",
    participantName: isUrdu ? "شرکت کنندہ کا نام" : "Participant Name",
    participantPlaceholder: isUrdu ? "مکمل نام" : "Full name",
    email: isUrdu ? "ای میل" : "Email",
    emailPlaceholder: "name@gmail.com",
    whatsapp: isUrdu ? "واٹس ایپ" : "WhatsApp",
    notes: isUrdu ? "تبصرے" : "Comments",
    notesPlaceholder: isUrdu ? "اگر آپ کوآرڈینیٹر کے ساتھ پہلے سے کچھ شیئر کرنا چاہتے ہیں" : "If you want to share anything in advance with the coordinator",
    studentName: isUrdu ? "طالب علم کا نام" : "Student Name",
    studentNamePlaceholder: isUrdu ? "طالب علم کا مکمل نام" : "Student full name",
    parentName: isUrdu ? "والدین کا نام" : "Parent Name",
    parentNamePlaceholder: isUrdu ? "والدین کا مکمل نام" : "Parent full name",
    enterStudentNames: isUrdu ? "طالبعلم کے نام درج کریں" : "Enter Student Names",
    enterStudentNamesPlaceholder: isUrdu ? "طالب علم کا نام" : "Student name",
    schoolName: isUrdu ? "اسکول کا نام" : "School Name",
    schoolNamePlaceholder: isUrdu ? "اسکول کا نام" : "School name",
    classInput: isUrdu ? "کلاس" : "Class",
    classInputPlaceholder: isUrdu ? "جماعت کا نام" : "Class name",
    addStudent: isUrdu ? "+" : "+",
    removeStudent: isUrdu ? "−" : "−",
    eventFee: isUrdu ? "ایونٹ فیس" : "Event Fee",
    startDate: isUrdu ? "تاریخ" : "Date",
    startTime: isUrdu ? "آغاز کا وقت" : "Start Time",
    endTime: isUrdu ? "اختتامی وقت" : "End Time",
    registrationDeadlineDate: isUrdu ? "رجسٹریشن کی آخری تاریخ" : "Registration Deadline Date",
    registrationDeadlineTime: isUrdu ? "رجسٹریشن کا آخری وقت" : "Registration Deadline Time",
    registerButton: isUrdu ? "ایونٹ کے لیے رجسٹر کریں" : "Register for Event",
    submitting: isUrdu ? "رجسٹریشن جمع ہو رہی ہے..." : "Submitting registration...",
    registrationSuccessful: isUrdu ? "رجسٹریشن کامیابی سے مکمل ہو گئی۔" : "Registration successful.",
    registrationNumber: isUrdu ? "رجسٹریشن نمبر" : "Registration Number",
    successMessage: isUrdu ? "آپ کی ایونٹ رجسٹریشن موصول ہو گئی ہے۔ اگر ادائیگی ضروری ہے تو نیچے دی گئی تفصیلات کے مطابق کوآرڈینیٹر سے رابطہ کریں۔" : "Your event registration has been received. If payment is required, use the details below and contact the coordinator to confirm your seat.",
    coordinator: isUrdu ? "کوآرڈینیٹر" : "Coordinator",
    submitError: isUrdu ? "ایونٹ رجسٹریشن جمع نہیں ہو سکی۔" : "Unable to submit event registration.",
    pastClosed: isUrdu ? "ماضی کے ایونٹس کے لیے رجسٹریشن بند ہے۔" : "Registration is closed for past events.",
    deadlinePassed: isUrdu ? "اس ایونٹ کی رجسٹریشن کی آخری تاریخ گزر چکی ہے۔" : "Registration deadline has passed for this event.",
    enterDigits: isUrdu ? `باقی ${localDigits} ہندسے درج کریں` : `Enter ${localDigits} digits`,
    remainingDigits: isUrdu ? `باقی ہندسے: ${Math.max(localDigits - localNumber.length, 0)} / ${localDigits}` : `Remaining digits: ${Math.max(localDigits - localNumber.length, 0)} / ${localDigits}`,
    requiredField: isUrdu ? "یہ فیلڈ ضروری ہے۔" : "This field is required.",
    invalidEmail: isUrdu ? "درست ای میل درج کریں۔" : "Please enter a valid email address.",
    invalidPhone: isUrdu ? "ملکی کوڈ کے ساتھ درست فون نمبر درج کریں۔" : "Enter a valid phone number with country code.",
    invalidNumber: isUrdu ? "درست نمبر درج کریں۔" : "Please enter a valid number.",
    atLeastOneStudent: isUrdu ? "کم از کم ایک طالب علم کا نام ضروری ہے۔" : "At least one student name is required.",
    addStudentButton: isUrdu ? "طالب علم شامل کریں" : "Add Student",
    formNotConfigured: isUrdu ? "اس ایونٹ کا رجسٹریشن فارم ابھی ترتیب نہیں دیا گیا۔" : "The registration form for this event is not configured yet.",
  };

  const blockedReason = useMemo(() => {
    if (activeEvent.lifecycle === "past") return uiText.pastClosed;
    if (hasRegistrationDeadlinePassed(activeEvent.registrationDeadline)) return uiText.deadlinePassed;
    return "";
  }, [activeEvent.lifecycle, activeEvent.registrationDeadline, uiText.deadlinePassed, uiText.pastClosed]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (mouseEvent: MouseEvent) => {
      if (!countryMenuRef.current?.contains(mouseEvent.target as Node)) {
        setCountryMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (open) {
      setSuccess(null);
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setLiveEvent(null);
      return;
    }

    let cancelled = false;

    const loadLatestEvent = async () => {
      try {
        const response = await fetch("/api/public-events", { cache: "no-store" });
        const payload = await response.json().catch(() => ({}));
        const source =
          payload && typeof payload === "object" && "data" in payload
            ? (payload as { data?: unknown }).data
            : payload;
        const body = (source && typeof source === "object" ? source : {}) as {
          currentUpcoming?: PublicEvent[];
          past?: PublicEvent[];
        };
        const latestEvent = [...(body.currentUpcoming || []), ...(body.past || [])].find(
          (item) => item.id === event.id
        );

        if (!cancelled && latestEvent) {
          setLiveEvent(latestEvent);
          setDynamicValues(buildDynamicValuesForFields(latestEvent.registrationFormSchema || []));
        }
      } catch {
        // Keep the already loaded event if the live refresh cannot complete.
      }
    };

    void loadLatestEvent();

    return () => {
      cancelled = true;
    };
  }, [event.id, open]);

  if (!open || !mounted) return null;

  function buildInitialDynamicValues() {
    return configuredFields.reduce<Record<string, string | string[]>>((nextValues, field) => {
      nextValues[field.id] = field.type === "multiple_student_names" ? [""] : "";
      return nextValues;
    }, {});
  }

  const getDynamicString = (fieldId: string) => {
    const value = dynamicValues[fieldId];
    return Array.isArray(value) ? value.join(", ") : value || "";
  };

  const getDynamicStudentNames = (fieldId: string) => {
    const value = dynamicValues[fieldId];
    return Array.isArray(value) && value.length > 0 ? value : [""];
  };

  const updateDynamicField = (fieldId: string, value: string | string[]) => {
    setDynamicValues((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: undefined }));
    }
    setSubmitError("");
  };

  const updateDynamicStudentName = (fieldId: string, index: number, value: string) => {
    const studentNames = [...getDynamicStudentNames(fieldId)];
    studentNames[index] = value;
    updateDynamicField(fieldId, studentNames);
  };

  const addDynamicStudentName = (fieldId: string) => {
    updateDynamicField(fieldId, [...getDynamicStudentNames(fieldId), ""]);
  };

  const removeDynamicStudentName = (fieldId: string, index: number) => {
    const studentNames = getDynamicStudentNames(fieldId).filter((_, itemIndex) => itemIndex !== index);
    updateDynamicField(fieldId, studentNames.length > 0 ? studentNames : [""]);
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const whatsappDigits = form.whatsapp.replace(/\D/g, "");
    const category = activeEvent.eventCategory;

    if (hasConfiguredFields) {
      for (const field of configuredFields) {
        const value = dynamicValues[field.id];
        const stringValue = Array.isArray(value) ? value.join(" ").trim() : String(value || "").trim();
        const studentNames = Array.isArray(value)
          ? value.map((name) => name.trim()).filter(Boolean)
          : [];

        if (field.required) {
          if (field.type === "multiple_student_names" && studentNames.length === 0) {
            nextErrors[field.id] = uiText.atLeastOneStudent;
            continue;
          }
          if (field.type !== "multiple_student_names" && !stringValue) {
            nextErrors[field.id] = uiText.requiredField;
            continue;
          }
        }

        if (field.type === "email" && stringValue && !emailRegex.test(stringValue)) {
          nextErrors[field.id] = uiText.invalidEmail;
        }
        if (field.type === "phone" && stringValue && !/^\+\d{1,4}\s?\d{6,14}$/.test(stringValue.replace(/[()-]/g, ""))) {
          nextErrors[field.id] = uiText.invalidPhone;
        }
        if (field.type === "number" && stringValue && !Number.isFinite(Number(stringValue))) {
          nextErrors[field.id] = uiText.invalidNumber;
        }
      }

      return nextErrors;
    }

    if (!form.participantName.trim()) {
      nextErrors.participantName = isUrdu ? "شرکت کنندہ کا نام ضروری ہے۔" : "Participant name is required.";
    } else if (!isValidName(form.participantName)) {
      nextErrors.participantName = isUrdu ? "درست نام درج کریں۔" : "Please enter a valid participant name.";
    }

    if (!form.email.trim()) {
      nextErrors.email = isUrdu ? "ای میل ضروری ہے۔" : "Email is required.";
    } else if (!emailRegex.test(form.email.trim())) {
      nextErrors.email = isUrdu ? "درست ای میل درج کریں۔" : "Please enter a valid email address.";
    }

    if (!form.whatsapp.trim()) {
      nextErrors.whatsapp = isUrdu ? "واٹس ایپ نمبر ضروری ہے۔" : "WhatsApp number is required.";
    } else if (whatsappDigits.length < 10) {
      nextErrors.whatsapp = isUrdu ? "درست واٹس ایپ نمبر درج کریں۔" : "Select a country code and enter a valid WhatsApp number.";
    }

    // Category-specific validations
    if (category === "alh-students" || category === "general-students") {
      if (!form.studentName?.trim()) {
        nextErrors.studentName = isUrdu ? "طالب علم کا نام ضروری ہے۔" : "Student name is required.";
      } else if (!isValidName(form.studentName)) {
        nextErrors.studentName = isUrdu ? "درست نام درج کریں۔" : "Please enter a valid student name.";
      }
    }

    if (category === "general-students") {
      if (!form.schoolName?.trim()) {
        nextErrors.schoolName = isUrdu ? "اسکول کا نام ضروری ہے۔" : "School name is required.";
      }
      if (!form.classInput?.trim()) {
        nextErrors.classInput = isUrdu ? "کلاس ضروری ہے۔" : "Class is required.";
      }
    }

    if (category === "alh-parents") {
      const studentNames = form.studentNames?.filter(name => name.trim()) || [];
      if (studentNames.length === 0) {
        nextErrors.studentNames = isUrdu ? "کم از کم ایک طالب علم کا نام ضروری ہے۔" : "At least one student name is required.";
      }
      for (const name of studentNames) {
        if (!isValidName(name)) {
          nextErrors.studentNames = isUrdu ? "درست نام درج کریں۔" : "Please enter valid student names.";
          break;
        }
      }
    }

    return nextErrors;
  };

  const updateField = (field: keyof FormState, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setSubmitError("");
  };

  const updateStudentName = (index: number, value: string) => {
    setForm((prev) => {
      const newStudentNames = [...(prev.studentNames || [])];
      newStudentNames[index] = value;
      return { ...prev, studentNames: newStudentNames };
    });
    if (errors.studentNames) {
      setErrors((prev) => ({ ...prev, studentNames: undefined }));
    }
    setSubmitError("");
  };

  const addStudentName = () => {
    setForm((prev) => ({
      ...prev,
      studentNames: [...(prev.studentNames || []), ""],
    }));
  };

  const removeStudentName = (index: number) => {
    setForm((prev) => {
      const newStudentNames = (prev.studentNames || []).filter((_, i) => i !== index);
      return { ...prev, studentNames: newStudentNames.length > 0 ? newStudentNames : [""] };
    });
  };

  const handlePhoneChange = (nextCode: string, nextNumber: string) => {
    const digits = getPhoneLocalDigitsForCode(nextCode);
    const sanitized = nextNumber.replace(/\D/g, "").slice(0, digits);
    setCountryCode(nextCode);
    setCountryMenuOpen(false);
    setLocalNumber(sanitized);
    updateField("whatsapp", sanitized ? `${nextCode} ${sanitized}` : "");
  };

  const handleDynamicPhoneChange = (fieldId: string, nextCode: string, nextNumber: string) => {
    const digits = getPhoneLocalDigitsForCode(nextCode);
    const sanitized = nextNumber.replace(/\D/g, "").slice(0, digits);
    setCountryCode(nextCode);
    setCountryMenuOpen(false);
    setLocalNumber(sanitized);
    updateDynamicField(fieldId, sanitized ? `${nextCode} ${sanitized}` : "");
  };

  const normalizedFieldLabel = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  const findCustomStringValue = (
    fields: Array<{ fieldId?: string; label: string; type: EventRegistrationField["type"]; value: string | string[] }>,
    type: EventRegistrationField["type"] | null,
    labelHints: string[],
    fieldIdHints: string[] = []
  ) => {
    const field = fields.find((item) => {
      const label = normalizedFieldLabel(item.label);
      const fieldId = "fieldId" in item ? normalizedFieldLabel(String(item.fieldId)) : "";
      return (
        (type ? item.type === type : false) ||
        labelHints.some((hint) => label.includes(hint)) ||
        fieldIdHints.some((hint) => fieldId.includes(hint))
      );
    });
    if (!field) return "";
    return Array.isArray(field.value) ? field.value.join(", ").trim() : field.value.trim();
  };

  const findCustomStudentNames = (
    fields: Array<{ fieldId?: string; label: string; type: EventRegistrationField["type"]; value: string | string[] }>
  ) => {
    const field = fields.find((item) => {
      const label = normalizedFieldLabel(item.label);
      const fieldId = normalizedFieldLabel(item.fieldId || "");
      return item.type === "multiple_student_names" || label.includes("student names") || fieldId.includes("studentnames");
    });
    if (!field) return [];
    return Array.isArray(field.value)
      ? field.value.map((name) => name.trim()).filter(Boolean)
      : field.value.split(",").map((name) => name.trim()).filter(Boolean);
  };

  function resetForm() {
    setForm({
      ...INITIAL_FORM,
      studentNames: [""],
    });
    setDynamicValues(buildInitialDynamicValues());
    setCountryCode("+92");
    setCountryMenuOpen(false);
    setLocalNumber("");
    setErrors({});
    setSubmitError("");
    setSubmitting(false);
  }

  const handleSubmit = async (submitEvent: FormEvent) => {
    submitEvent.preventDefault();
    if (blockedReason || submitting) return;

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const category = activeEvent.eventCategory;
      let requestPayload: Record<string, unknown>;

      if (hasConfiguredFields) {
        const customFieldValues = configuredFields.reduce<Record<string, string | string[]>>((answers, field) => {
          const value =
            field.type === "multiple_student_names"
              ? getDynamicStudentNames(field.id).map((name) => name.trim()).filter(Boolean)
              : getDynamicString(field.id).trim();

          answers[field.id] = value;
          return answers;
        }, {});
        const stringAnswer = (fieldId: string) => {
          const value = customFieldValues[fieldId];
          return Array.isArray(value) ? value.join(", ").trim() : String(value || "").trim();
        };
        const firstEmail =
          stringAnswer("email") ||
          stringAnswer(configuredFields.find((field) => field.type === "email")?.id || "");
        const firstPhone =
          stringAnswer("whatsapp") ||
          stringAnswer("phone") ||
          stringAnswer("mobile") ||
          stringAnswer(configuredFields.find((field) => field.type === "phone")?.id || "");
        const parentName = stringAnswer("parentName") || stringAnswer("guardianName");
        const studentName = stringAnswer("studentName") || stringAnswer("childName");
        const schoolName = stringAnswer("schoolName");
        const classInput = stringAnswer("classInput") || stringAnswer("classLevel") || stringAnswer("grade");
        const studentNamesFieldId =
          configuredFields.find((field) => field.type === "multiple_student_names")?.id ||
          "studentNames";
        const studentNamesValue = customFieldValues[studentNamesFieldId];
        const studentNames = Array.isArray(studentNamesValue)
          ? studentNamesValue.map((name) => name.trim()).filter(Boolean)
          : [];
        const firstName =
          parentName ||
          studentName ||
          configuredFields
            .map((field) => stringAnswer(field.id))
            .find((value) => value) ||
          "Event Participant";

        requestPayload = {
          eventId: activeEvent.id,
          participantName: String(firstName).trim(),
          parentName,
          studentName,
          studentNames,
          schoolName,
          classInput,
          email: firstEmail,
          whatsapp: firstPhone,
          notes: "",
          customFieldValues,
        };
      } else {
        requestPayload = {
          eventId: activeEvent.id,
          participantName: form.participantName.trim(),
          parentName: form.participantName.trim(),
          email: form.email.trim(),
          whatsapp: form.whatsapp.trim(),
          notes: form.notes.trim(),
        };
      }

      if (!hasConfiguredFields && (category === "alh-students" || category === "general-students")) {
        requestPayload.studentName = form.studentName?.trim();
      }

      if (!hasConfiguredFields && category === "general-students") {
        requestPayload.schoolName = form.schoolName?.trim();
        requestPayload.classInput = form.classInput?.trim();
      }

      if (!hasConfiguredFields && category === "alh-parents") {
        requestPayload.studentNames = (form.studentNames || []).filter(name => name.trim());
      }

      const response = await fetch("/api/public-event-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setSubmitError(extractApiError(payload, uiText.submitError));
        setSubmitting(false);
        return;
      }

      setSuccess({
        registrationNumber: extractRegistrationNumber(payload) || "-",
        message: uiText.successMessage,
        requiresPayment: Boolean((payload as { requiresPayment?: unknown }).requiresPayment),
        customFieldValues: extractSubmittedCustomFields(payload),
      });
      resetForm();
    } catch {
      setSubmitError(uiText.submitError);
      setSubmitting(false);
    }
  };

  const renderDynamicField = (field: EventRegistrationField) => {
    const error = errors[field.id];
    const requiredMark = field.required ? " *" : "";
    const commonInputClass =
      "min-h-12 w-full rounded-2xl border border-emerald/12 bg-white px-4 py-3 outline-none transition focus:border-gold";
    const label = (
      <label className={labelClassName}>
        {field.label}
        {requiredMark}
      </label>
    );

    if (field.type === "long_text") {
      return (
        <div key={field.id}>
          {label}
          <textarea
            value={getDynamicString(field.id)}
            onChange={(eventChange) => updateDynamicField(field.id, eventChange.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="w-full rounded-[24px] border border-emerald/12 bg-white px-4 py-3 outline-none transition focus:border-gold"
          />
          {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
        </div>
      );
    }

    if (field.type === "multiple_student_names") {
      const studentNames = getDynamicStudentNames(field.id);
      return (
        <div key={field.id}>
          {label}
          <div className="space-y-2">
            {studentNames.map((studentName, index) => (
              <div key={`${field.id}-${index}`} className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={studentName}
                  onChange={(eventChange) =>
                    updateDynamicStudentName(field.id, index, eventChange.target.value)
                  }
                  placeholder={field.placeholder || uiText.enterStudentNamesPlaceholder}
                  className="min-h-12 flex-1 rounded-2xl border border-emerald/12 bg-white px-4 py-3 outline-none transition focus:border-gold"
                />
                <div className="flex gap-2">
                  {index === studentNames.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => addDynamicStudentName(field.id)}
                      className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-emerald/12 bg-white px-4 py-3 text-sm font-semibold text-emerald-deep transition hover:border-gold hover:text-gold"
                    >
                      {uiText.addStudentButton}
                    </button>
                  ) : null}
                  {studentNames.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeDynamicStudentName(field.id, index)}
                      className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-3 py-3 font-semibold text-red-600 transition hover:border-red-400 hover:text-red-700"
                    >
                      {uiText.removeStudent}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
        </div>
      );
    }

    if (field.type === "phone") {
      return (
        <div key={field.id}>
          {label}
          <div className="flex gap-3">
            <div ref={countryMenuRef} className="relative w-[34%] min-w-[140px]">
              <button
                type="button"
                onClick={() => setCountryMenuOpen((openState) => !openState)}
                className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-emerald/12 bg-white px-3 py-3 text-left outline-none transition hover:border-gold"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-emerald-deep">
                  <span className="text-base leading-none">{selectedCountryFlag}</span>
                  <span>{selectedCountry.code}</span>
                </span>
                <span className="text-xs text-emerald-deep/70">▼</span>
              </button>
              {countryMenuOpen ? (
                <div className="absolute left-0 top-[calc(100%+8px)] z-30 max-h-72 w-[260px] overflow-y-auto rounded-2xl border border-emerald/12 bg-white py-2 shadow-[0_18px_50px_rgba(13,59,46,0.16)]">
                  {PHONE_COUNTRY_CODES.map((option) => {
                    const optionFlag = getCountryFlagForOption(option.label, (option as { flag?: string }).flag);
                    const isSelected = option.code === countryCode;
                    return (
                      <button
                        key={`${option.code}-${option.label}`}
                        type="button"
                        onClick={() => handleDynamicPhoneChange(field.id, option.code, localNumber)}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition hover:bg-cream ${isSelected ? "bg-emerald-deep/6 font-semibold text-emerald-deep" : "text-emerald-deep/85"}`}
                      >
                        <span className="w-6 text-base leading-none">{optionFlag}</span>
                        <span className="min-w-[46px] font-semibold">{option.code}</span>
                        <span className="truncate">{option.label.replace(/\s*\(\+\d+\)\s*$/, "")}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
            <input
              value={localNumber}
              onChange={(eventChange) =>
                handleDynamicPhoneChange(field.id, countryCode, eventChange.target.value)
              }
              placeholder={field.placeholder || uiText.enterDigits}
              inputMode="numeric"
              className="min-h-12 w-[66%] rounded-2xl border border-emerald/12 bg-white px-4 py-3 outline-none transition focus:border-gold"
            />
          </div>
          <p className="mt-2 text-sm text-emerald-deep/70">{uiText.remainingDigits}</p>
          {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
        </div>
      );
    }

    const inputType =
      field.type === "email"
        ? "email"
        : field.type === "number"
          ? "number"
          : field.type === "date"
            ? "date"
            : "text";

    return (
      <div key={field.id}>
        {label}
        <input
          type={inputType}
          value={getDynamicString(field.id)}
          onChange={(eventChange) => updateDynamicField(field.id, eventChange.target.value)}
          placeholder={field.placeholder}
          inputMode={field.type === "number" ? "decimal" : undefined}
          className={commonInputClass}
        />
        {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] isolate flex items-start justify-center bg-emerald-deep/65 px-3 pb-6 pt-2 sm:items-center sm:px-6 sm:py-8">
      <div
        dir={isUrdu ? "rtl" : "ltr"}
        className={`relative max-h-[96vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-emerald/10 bg-[linear-gradient(180deg,#fffdf8,#f7f1e6)] p-5 shadow-[0_30px_100px_rgba(13,59,46,0.28)] sm:max-h-[90vh] sm:rounded-[32px] sm:p-8 ${isUrdu ? "font-urdu text-right" : ""}`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex min-h-10 items-center justify-center rounded-full border border-emerald/12 bg-white px-4 text-sm font-semibold text-emerald-deep transition hover:border-gold hover:text-gold"
        >
          {uiText.close}
        </button>

        <p className="pr-20 text-xs font-bold uppercase tracking-[0.24em] text-gold">
          {activeEvent.title}
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-emerald-deep">
          {uiText.reserveSeat}
        </h2>
        {!success ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-deep/75">
            {uiText.reserveSeatBody}
          </p>
        ) : null}

        <div className="mt-6 rounded-[24px] border border-emerald/10 bg-white/80 p-5 text-sm text-emerald-deep/85">
          <h3 className="font-display text-xl font-bold text-emerald-deep">{activeEvent.title}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><span className="font-semibold">{uiText.startDate}:</span> <span dir="ltr" className="inline-block [unicode-bidi:isolate]">{formatEventDate(activeEvent.startAt)}</span></div>
            <div><span className="font-semibold">{uiText.startTime}:</span> <span dir="ltr" className="inline-block [unicode-bidi:isolate]">{formatEventTime(activeEvent.startAt)}</span></div>
            <div><span className="font-semibold">{uiText.endTime}:</span> <span dir="ltr" className="inline-block [unicode-bidi:isolate]">{formatEventTime(activeEvent.endAt)}</span></div>
            <div><span className="font-semibold">{uiText.eventFee}:</span> <span dir="ltr" className="inline-block [unicode-bidi:isolate]">{formatEventFee(activeEvent.fee)}</span></div>
            <div><span className="font-semibold">{uiText.registrationDeadlineDate}:</span> <span dir="ltr" className="inline-block [unicode-bidi:isolate]">{formatEventDate(activeEvent.registrationDeadline)}</span></div>
            <div><span className="font-semibold">{uiText.registrationDeadlineTime}:</span> <span dir="ltr" className="inline-block [unicode-bidi:isolate]">{formatEventTime(activeEvent.registrationDeadline)}</span></div>
          </div>
        </div>

        {blockedReason ? <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">{blockedReason}</div> : null}
        {submitError ? <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">{submitError}</div> : null}

        {success ? (
          <div className="mt-6 rounded-[24px] border border-emerald/15 bg-emerald/5 px-5 py-5 text-sm text-emerald-deep">
            <p className="font-semibold">{uiText.registrationSuccessful}</p>
            <p className="mt-2">{uiText.registrationNumber}: <span className="font-semibold">{success.registrationNumber}</span></p>
            <p className="mt-2 leading-7">{success.message}</p>
            {success.customFieldValues.length > 0 ? (
              <div className="mt-4 rounded-2xl border border-emerald/10 bg-white/70 px-4 py-4 text-sm leading-7">
                {success.customFieldValues.map((field) => (
                  <p key={field.label}>
                    <span className="font-semibold">{field.label}:</span>{" "}
                    {Array.isArray(field.value) ? field.value.join(", ") : field.value || "-"}
                  </p>
                ))}
              </div>
            ) : null}
            {success.requiresPayment ? (
            <div className="mt-4 rounded-2xl border border-gold/20 bg-white/70 px-4 py-4 text-sm leading-7">
              <p><span className="font-semibold">{uiText.eventFee}:</span> {formatEventFee(activeEvent.fee)}</p>
              <p><span className="font-semibold">{uiText.coordinator}:</span> Shoaib Ul Din</p>
              <p><span className="font-semibold">{uiText.email}:</span> coordinator@ashshajrah.com</p>
              <p><span className="font-semibold">{uiText.whatsapp}:</span> +923473547036</p>
            </div>
            ) : null}
          </div>
        ) : null}

        {!success ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {hasConfiguredFields ? (
            <>
              {configuredFields.map(renderDynamicField)}
              <button
                type="submit"
                disabled={Boolean(blockedReason) || submitting}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-emerald-deep px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold hover:text-emerald-deep disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? uiText.submitting : uiText.registerButton}
              </button>
            </>
          ) : false ? (
            <>
          {(activeEvent.eventCategory === "alh-students" || activeEvent.eventCategory === "general-students") && (
            <div>
              <label className={labelClassName}>{uiText.studentName} *</label>
              <input
                value={form.studentName || ""}
                onChange={(eventChange) => updateField("studentName", eventChange.target.value)}
                placeholder={uiText.studentNamePlaceholder}
                className="min-h-12 w-full rounded-2xl border border-emerald/12 bg-white px-4 py-3 outline-none transition focus:border-gold"
              />
              {errors.studentName ? <p className="mt-2 text-sm text-red-700">{errors.studentName}</p> : null}
            </div>
          )}

          <div>
            <label className={labelClassName}>{uiText.parentName} *</label>
            <input
              value={form.participantName}
              onChange={(eventChange) => updateField("participantName", eventChange.target.value)}
              placeholder={uiText.parentNamePlaceholder}
              className="min-h-12 w-full rounded-2xl border border-emerald/12 bg-white px-4 py-3 outline-none transition focus:border-gold"
            />
            {errors.participantName ? <p className="mt-2 text-sm text-red-700">{errors.participantName}</p> : null}
          </div>

          {activeEvent.eventCategory === "alh-parents" && (
            <>
              {/* Keep this block in the file for future parent-event use. */}
              <div>
                <label className={labelClassName}>{uiText.enterStudentNames} *</label>
                <div className="space-y-2">
                  {(form.studentNames || []).map((studentName, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={studentName}
                        onChange={(eventChange) => updateStudentName(index, eventChange.target.value)}
                        placeholder={uiText.enterStudentNamesPlaceholder}
                        className="min-h-12 flex-1 rounded-2xl border border-emerald/12 bg-white px-4 py-3 outline-none transition focus:border-gold"
                      />
                      <div className="flex gap-1">
                        {index === (form.studentNames || []).length - 1 && (
                          <button
                            type="button"
                            onClick={addStudentName}
                            className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-2xl border border-emerald/12 bg-white px-3 py-3 font-semibold text-emerald-deep transition hover:border-gold hover:text-gold"
                          >
                            {uiText.addStudent}
                          </button>
                        )}
                        {(form.studentNames || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStudentName(index)}
                            className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-3 py-3 font-semibold text-red-600 transition hover:border-red-400 hover:text-red-700"
                          >
                            {uiText.removeStudent}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.studentNames ? <p className="mt-2 text-sm text-red-700">{errors.studentNames}</p> : null}
              </div>
            </>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClassName}>{uiText.email} *</label>
              <input
                type="email"
                value={form.email}
                onChange={(eventChange) => updateField("email", eventChange.target.value)}
                placeholder={uiText.emailPlaceholder}
                className="min-h-12 w-full rounded-2xl border border-emerald/12 bg-white px-4 py-3 outline-none transition focus:border-gold"
              />
              {errors.email ? <p className="mt-2 text-sm text-red-700">{errors.email}</p> : null}
            </div>

            <div>
              <label className={labelClassName}>{uiText.whatsapp} *</label>
              <div className="flex gap-3">
                <div ref={countryMenuRef} className="relative w-[34%] min-w-[140px]">
                  <button
                    type="button"
                    onClick={() => setCountryMenuOpen((openState) => !openState)}
                    className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-emerald/12 bg-white px-3 py-3 text-left outline-none transition hover:border-gold"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-emerald-deep">
                      <span className="text-base leading-none">{selectedCountryFlag}</span>
                      <span>{selectedCountry.code}</span>
                    </span>
                    <span className="text-xs text-emerald-deep/70">▼</span>
                  </button>
                  {countryMenuOpen ? (
                    <div className="absolute left-0 top-[calc(100%+8px)] z-30 max-h-72 w-[260px] overflow-y-auto rounded-2xl border border-emerald/12 bg-white py-2 shadow-[0_18px_50px_rgba(13,59,46,0.16)]">
                      {PHONE_COUNTRY_CODES.map((option) => {
                        const optionFlag = getCountryFlagForOption(option.label, (option as { flag?: string }).flag);
                        const isSelected = option.code === countryCode;
                        return (
                          <button
                            key={`${option.code}-${option.label}`}
                            type="button"
                            onClick={() => handlePhoneChange(option.code, localNumber)}
                            className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition hover:bg-cream ${isSelected ? "bg-emerald-deep/6 font-semibold text-emerald-deep" : "text-emerald-deep/85"}`}
                          >
                            <span className="w-6 text-base leading-none">{optionFlag}</span>
                            <span className="min-w-[46px] font-semibold">{option.code}</span>
                            <span className="truncate">{option.label.replace(/\s*\(\+\d+\)\s*$/, "")}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
                <input
                  value={localNumber}
                  onChange={(eventChange) => handlePhoneChange(countryCode, eventChange.target.value)}
                  placeholder={uiText.enterDigits}
                  inputMode="numeric"
                  className="min-h-12 w-[66%] rounded-2xl border border-emerald/12 bg-white px-4 py-3 outline-none transition focus:border-gold"
                />
              </div>
              <p className="mt-2 text-sm text-emerald-deep/70">{uiText.remainingDigits}</p>
              {errors.whatsapp ? <p className="mt-2 text-sm text-red-700">{errors.whatsapp}</p> : null}
            </div>
          </div>

          {activeEvent.eventCategory === "general-students" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClassName}>{uiText.schoolName} *</label>
                <input
                  value={form.schoolName || ""}
                  onChange={(eventChange) => updateField("schoolName", eventChange.target.value)}
                  placeholder={uiText.schoolNamePlaceholder}
                  className="min-h-12 w-full rounded-2xl border border-emerald/12 bg-white px-4 py-3 outline-none transition focus:border-gold"
                />
                {errors.schoolName ? <p className="mt-2 text-sm text-red-700">{errors.schoolName}</p> : null}
              </div>

              <div>
                <label className={labelClassName}>{uiText.classInput} *</label>
                <input
                  value={form.classInput || ""}
                  onChange={(eventChange) => updateField("classInput", eventChange.target.value)}
                  placeholder={uiText.classInputPlaceholder}
                  className="min-h-12 w-full rounded-2xl border border-emerald/12 bg-white px-4 py-3 outline-none transition focus:border-gold"
                />
                {errors.classInput ? <p className="mt-2 text-sm text-red-700">{errors.classInput}</p> : null}
              </div>
            </div>
          )}

          <div>
            <label className={labelClassName}>{uiText.notes}</label>
            <textarea
              value={form.notes}
              onChange={(eventChange) => updateField("notes", eventChange.target.value)}
              placeholder={uiText.notesPlaceholder}
              rows={4}
              className="w-full rounded-[24px] border border-emerald/12 bg-white px-4 py-3 outline-none transition focus:border-gold"
            />
          </div>

          <button
            type="submit"
            disabled={Boolean(blockedReason) || submitting}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-emerald-deep px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold hover:text-emerald-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? uiText.submitting : uiText.registerButton}
          </button>
            </>
          ) : (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-900">
              {uiText.formNotConfigured}
            </div>
          )}
        </form>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
