"use client";

import { useState, FormEvent } from "react";
import {
  validateRegistrationForm,
  PROGRAMME_LEVELS,
  type RegistrationFormData,
  type RegistrationFormErrors,
} from "@/lib/register-form";
import { useLanguage } from "@/contexts/LanguageContext";

const INITIAL: RegistrationFormData = {
  parentName: "",
  whatsapp: "",
  email: "",
  childName: "",
  childAge: "",
  level: "",
  cityCountry: "",
  message: "",
  website: "",
};

const inputClass =
  "form-input w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-cream outline-none transition-all duration-300 placeholder:text-cream/30 focus:border-gold focus:bg-white/15 focus:shadow-[0_0_0_3px_rgba(201,162,39,0.15)]";

const selectClass =
  "form-select w-full rounded-xl border border-white/20 bg-emerald-deep px-4 py-2.5 text-sm text-cream outline-none transition-all duration-300 focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,162,39,0.15)]";

function FormLabel({
  htmlFor,
  label,
  required,
  language,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
  language: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`mb-2 block text-sm font-semibold ${language === 'ur' ? 'text-right font-urdu' : 'text-left'}`}
    >
      <span className={`text-xs font-semibold text-cream/85 ${language !== 'ur' ? 'uppercase tracking-wider' : ''}`}>
        {label} {required && <span className="text-gold ml-1">*</span>}
      </span>
    </label>
  );
}

export function RegistrationForm() {
  const { t, language } = useLanguage();
  const [form, setForm] = useState<RegistrationFormData>(INITIAL);
  const [errors, setErrors] = useState<RegistrationFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const update = (field: keyof RegistrationFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const validationErrors = validateRegistrationForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          preferredLanguage: language
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setSubmitError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
      setForm(INITIAL);
      setErrors({});
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`mx-auto max-w-xl rounded-2xl border border-white/20 bg-white/10 p-8 text-center shadow-xl backdrop-blur-md ${language === 'ur' ? 'font-urdu' : ''}`}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/20 text-2xl text-gold">
          ✓
        </div>
        <p className={`text-xl font-semibold leading-relaxed text-cream ${language === 'ur' ? 'leading-[2]' : 'font-display'}`}>
          {t.register.form.success}
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className={`mt-6 text-sm font-semibold text-gold transition-colors hover:text-cream ${language === 'ur' ? 'font-sans' : ''}`}
        >
          {language === 'ur' ? 'مزید رجسٹریشن جمع کریں' : 'Submit another registration'}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      dir={language === "ur" ? "rtl" : "ltr"}
      className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-white/5 p-6 shadow-2xl backdrop-blur-md sm:p-8"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-emerald-light/10 blur-3xl" />

      <div className="relative">
        {submitError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50/10 px-4 py-3 text-center">
            <p className={`text-sm font-medium text-red-200 ${language === 'ur' ? 'font-urdu leading-[2]' : ''}`}>{t.register.form.error}</p>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {/* Parent Name */}
          <div className={language === 'ur' ? 'text-right' : 'text-left'}>
            <FormLabel htmlFor="parentName" label={t.register.form.parentName} language={language} required />
            <input
              id="parentName"
              type="text"
              required
              dir={language === "ur" ? "rtl" : "ltr"}
              value={form.parentName}
              onChange={(e) => update("parentName", e.target.value)}
              className={`${inputClass} ${language === "ur" ? "text-right font-urdu placeholder:text-right" : "text-left"}`}
              placeholder={t.register.form.placeholders.parentName}
            />
            {errors.parentName && <p className="mt-1 text-xs text-red-300">{errors.parentName}</p>}
          </div>

          {/* WhatsApp */}
          <div className={language === 'ur' ? 'text-right' : 'text-left'}>
            <FormLabel htmlFor="whatsapp" label={t.register.form.whatsapp} language={language} required />
            <input
              id="whatsapp"
              type="tel"
              required
              dir="ltr"
              value={form.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)}
              className={`${inputClass} ${language === "ur" ? "text-right placeholder:text-right" : "text-left"}`}
              placeholder={t.register.form.placeholders.whatsapp}
            />
            {errors.whatsapp && <p className="mt-1 text-xs text-red-300">{errors.whatsapp}</p>}
          </div>

          {/* Email */}
          <div className={`md:col-span-2 ${language === 'ur' ? 'text-right' : 'text-left'}`}>
            <FormLabel htmlFor="email" label={t.register.form.email} language={language} required />
            <input
              id="email"
              type="email"
              required
              dir="ltr"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={`${inputClass} ${language === "ur" ? "text-right placeholder:text-right" : "text-left"}`}
              placeholder={t.register.form.placeholders.email}
            />
            {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email}</p>}
          </div>

          {/* Child Name */}
          <div className={language === 'ur' ? 'text-right' : 'text-left'}>
            <FormLabel htmlFor="childName" label={t.register.form.childName} language={language} required />
            <input
              id="childName"
              type="text"
              required
              dir={language === "ur" ? "rtl" : "ltr"}
              value={form.childName}
              onChange={(e) => update("childName", e.target.value)}
              className={`${inputClass} ${language === "ur" ? "text-right font-urdu placeholder:text-right" : "text-left"}`}
              placeholder={t.register.form.placeholders.childName}
            />
            {errors.childName && <p className="mt-1 text-xs text-red-300">{errors.childName}</p>}
          </div>

          {/* Child Age */}
          <div className={language === 'ur' ? 'text-right' : 'text-left'}>
            <FormLabel htmlFor="childAge" label={t.register.form.childAge} language={language} required />
            <input
              id="childAge"
              type="text"
              required
              dir="ltr"
              value={form.childAge}
              onChange={(e) => update("childAge", e.target.value)}
              className={`${inputClass} ${language === "ur" ? "text-right placeholder:text-right" : "text-left"}`}
              placeholder={t.register.form.placeholders.childAge}
            />
            {errors.childAge && <p className="mt-1 text-xs text-red-300">{errors.childAge}</p>}
          </div>

          {/* Programme Level */}
          <div className={language === 'ur' ? 'text-right' : 'text-left'}>
            <FormLabel htmlFor="level" label={t.register.form.interestedLevel} language={language} required />
            <select
              id="level"
              required
              dir={language === "ur" ? "rtl" : "ltr"}
              value={form.level}
              onChange={(e) => update("level", e.target.value)}
              className={`${selectClass} ${language === "ur" ? "text-right font-urdu" : "text-left"}`}
            >
              <option value="" className="text-[#0d3b2e] bg-cream">{t.register.form.placeholders.level}</option>
              {PROGRAMME_LEVELS.map((level) => {
                const levelKey = {
                  "Play Group": "playgroup",
                  "Prep-I": "prepI",
                  "Prep-II": "prepII",
                  "Not Sure / Need Guidance": "notSure",
                }[level] as keyof typeof t.register.form.levels;
                
                return (
                  <option key={level} value={level} className="text-[#0d3b2e] bg-cream">
                    {t.register.form.levels[levelKey]}
                  </option>
                );
              })}
            </select>
            {errors.level && <p className="mt-1 text-xs text-red-300">{errors.level}</p>}
          </div>

          {/* City / Country */}
          <div className={language === 'ur' ? 'text-right' : 'text-left'}>
            <FormLabel htmlFor="cityCountry" label={t.register.form.cityCountry} language={language} required />
            <input
              id="cityCountry"
              type="text"
              required
              dir={language === "ur" ? "rtl" : "ltr"}
              value={form.cityCountry}
              onChange={(e) => update("cityCountry", e.target.value)}
              className={`${inputClass} ${language === "ur" ? "text-right font-urdu placeholder:text-right" : "text-left"}`}
              placeholder={t.register.form.placeholders.cityCountry}
            />
            {errors.cityCountry && <p className="mt-1 text-xs text-red-300">{errors.cityCountry}</p>}
          </div>

          {/* Message */}
          <div className={`md:col-span-2 ${language === 'ur' ? 'text-right' : 'text-left'}`}>
            <FormLabel htmlFor="message" label={t.register.form.message} language={language} />
            <textarea
              id="message"
              rows={3}
              dir={language === "ur" ? "rtl" : "ltr"}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              className={`${inputClass} resize-none ${language === "ur" ? "text-right font-urdu placeholder:text-right" : "text-left"}`}
              placeholder={t.register.form.placeholders.message}
            />
          </div>
        </div>

        {/* Honeypot */}
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
          />
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-full bg-gold px-8 py-3.5 text-sm font-semibold tracking-wide text-[#0d3b2e] shadow-lg shadow-gold/25 transition-all duration-300 hover:bg-gold-soft hover:shadow-gold/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[280px] ${language === 'ur' ? 'font-urdu' : ''}`}
          >
            {loading ? (language === 'ur' ? "جمع کر رہا ہے..." : "Submitting...") : t.register.form.submit}
          </button>
        </div>
      </div>
    </form>
  );
}
