"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  formatEventDate,
  formatEventFee,
  formatEventTime,
  hasRegistrationDeadlinePassed,
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

type FormErrors = Partial<Record<keyof FormState, string>>;

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
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [countryCode, setCountryCode] = useState("+92");
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [localNumber, setLocalNumber] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ registrationNumber: string; message: string } | null>(null);
  const countryMenuRef = useRef<HTMLDivElement | null>(null);
  const labelClassName = "mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-emerald-deep/90";

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
    registerButton: isUrdu ? "ایونٹ کے لیے رجسٹر کریں" : "Register for Event",
    submitting: isUrdu ? "رجسٹریشن جمع ہو رہی ہے..." : "Submitting registration...",
    registrationSuccessful: isUrdu ? "رجسٹریشن کامیابی سے مکمل ہو گئی۔" : "Registration successful.",
    registrationNumber: isUrdu ? "رجسٹریشن نمبر" : "Registration Number",
    successMessage: isUrdu ? "آپ کی ایونٹ رجسٹریشن موصول ہو گئی ہے۔ ادائیگی کے بعد اپنی نشست کی تصدیق کے لیے کوآرڈینیٹر سے رابطہ کریں۔ (ادائیگی کی تفصیلات آپ کو ای میل کر دی گئی ہیں)" : "Your event registration has been received. After payment, contact the coordinator to confirm your seat. (Payment details are in the email already sent to you.)",
    coordinator: isUrdu ? "کوآرڈینیٹر" : "Coordinator",
    submitError: isUrdu ? "ایونٹ رجسٹریشن جمع نہیں ہو سکی۔" : "Unable to submit event registration.",
    pastClosed: isUrdu ? "ماضی کے ایونٹس کے لیے رجسٹریشن بند ہے۔" : "Registration is closed for past events.",
    deadlinePassed: isUrdu ? "اس ایونٹ کی رجسٹریشن کی آخری تاریخ گزر چکی ہے۔" : "Registration deadline has passed for this event.",
    enterDigits: isUrdu ? `باقی ${localDigits} ہندسے درج کریں` : `Enter ${localDigits} digits`,
    remainingDigits: isUrdu ? `باقی ہندسے: ${Math.max(localDigits - localNumber.length, 0)} / ${localDigits}` : `Remaining digits: ${Math.max(localDigits - localNumber.length, 0)} / ${localDigits}`,
  };

  const blockedReason = useMemo(() => {
    if (event.lifecycle === "past") return uiText.pastClosed;
    if (hasRegistrationDeadlinePassed(event.registrationDeadline)) return uiText.deadlinePassed;
    return "";
  }, [event.lifecycle, event.registrationDeadline, uiText.deadlinePassed, uiText.pastClosed]);

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

  if (!open) return null;

  const validate = () => {
    const nextErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const whatsappDigits = form.whatsapp.replace(/\D/g, "");
    const category = event.eventCategory;

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

  const resetForm = () => {
    setForm({
      ...INITIAL_FORM,
      studentNames: [""],
    });
    setCountryCode("+92");
    setCountryMenuOpen(false);
    setLocalNumber("");
    setErrors({});
    setSubmitError("");
    setSubmitting(false);
  };

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
      const category = event.eventCategory;
      const requestPayload: Record<string, unknown> = {
        eventId: event.id,
        participantName: form.participantName.trim(),
        parentName: form.participantName.trim(),
        email: form.email.trim(),
        whatsapp: form.whatsapp.trim(),
        notes: form.notes.trim(),
      };

      if (category === "alh-students" || category === "general-students") {
        requestPayload.studentName = form.studentName?.trim();
      }

      if (category === "general-students") {
        requestPayload.schoolName = form.schoolName?.trim();
        requestPayload.classInput = form.classInput?.trim();
      }

      if (category === "alh-parents") {
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
      });
      resetForm();
    } catch {
      setSubmitError(uiText.submitError);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-emerald-deep/65 px-4 py-6">
      <div
        dir={isUrdu ? "rtl" : "ltr"}
        className={`relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-emerald/10 bg-[linear-gradient(180deg,#fffdf8,#f7f1e6)] p-6 shadow-[0_30px_100px_rgba(13,59,46,0.28)] sm:p-8 ${isUrdu ? "font-urdu text-right" : ""}`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex min-h-10 items-center justify-center rounded-full border border-emerald/12 bg-white px-4 text-sm font-semibold text-emerald-deep transition hover:border-gold hover:text-gold"
        >
          {uiText.close}
        </button>

        <p className="pr-20 text-xs font-bold uppercase tracking-[0.24em] text-gold">
          {event.title}
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
          <h3 className="font-display text-xl font-bold text-emerald-deep">{event.title}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><span className="font-semibold">Start Date:</span> {formatEventDate(event.startAt)}</div>
            <div><span className="font-semibold">Start Time:</span> {formatEventTime(event.startAt)}</div>
            <div><span className="font-semibold">End Time:</span> {formatEventTime(event.endAt)}</div>
            <div><span className="font-semibold">{uiText.eventFee}:</span> {formatEventFee(event.fee)}</div>
            <div><span className="font-semibold">Registration Deadline Date:</span> {formatEventDate(event.registrationDeadline)}</div>
            <div><span className="font-semibold">Registration Deadline Time:</span> {formatEventTime(event.registrationDeadline)}</div>
          </div>
        </div>

        {blockedReason ? <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">{blockedReason}</div> : null}
        {submitError ? <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">{submitError}</div> : null}

        {success ? (
          <div className="mt-6 rounded-[24px] border border-emerald/15 bg-emerald/5 px-5 py-5 text-sm text-emerald-deep">
            <p className="font-semibold">{uiText.registrationSuccessful}</p>
            <p className="mt-2">{uiText.registrationNumber}: <span className="font-semibold">{success.registrationNumber}</span></p>
            <p className="mt-2 leading-7">{success.message}</p>
            <div className="mt-4 rounded-2xl border border-gold/20 bg-white/70 px-4 py-4 text-sm leading-7">
              <p><span className="font-semibold">{uiText.eventFee}:</span> {formatEventFee(event.fee)}</p>
              <p><span className="font-semibold">{uiText.coordinator}:</span> Shoaib Ul Din</p>
              <p><span className="font-semibold">{uiText.email}:</span> coordinator@ashshajrah.com</p>
              <p><span className="font-semibold">{uiText.whatsapp}:</span> +923473547036</p>
            </div>
          </div>
        ) : null}

        {!success ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {(event.eventCategory === "alh-students" || event.eventCategory === "general-students") && (
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

          {event.eventCategory === "alh-parents" && (
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

          {event.eventCategory === "general-students" && (
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
        </form>
        ) : null}
      </div>
    </div>
  );
}
