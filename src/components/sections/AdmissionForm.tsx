"use client";

import { useState, FormEvent } from "react";
import {
  validateContactForm,
  type ContactFormData,
  type ContactFormErrors,
} from "@/lib/contact-form";
import { useLanguage } from "@/contexts/LanguageContext";

const INITIAL: ContactFormData = {
  name: "",
  whatsapp: "",
  email: "",
  message: "",
  website: "",
};

const inputClass =
  "form-input w-full rounded-xl border border-emerald/15 bg-white/90 px-4 py-2.5 text-sm text-emerald-deep outline-none transition-all duration-300 placeholder:text-emerald/35 focus:border-emerald focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,138,106,0.12)]";

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
      className={`mb-1.5 flex items-baseline gap-2 ${language === 'ur' ? 'flex-row-reverse' : ''}`}
    >
      <span className={`${language === 'ur' ? 'font-urdu' : 'uppercase tracking-wider'} text-xs font-semibold text-emerald/70`}>
        {label} {required && <span className="text-gold">*</span>}
      </span>
    </label>
  );
}

export function AdmissionForm() {
  const { t, language } = useLanguage();
  const [form, setForm] = useState<ContactFormData>(INITIAL);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const update = (field: keyof ContactFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const validationErrors = validateContactForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/contact", {
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
      <div className={`admission-form-card mx-auto max-w-xl rounded-2xl border border-emerald/15 bg-white/85 p-8 text-center shadow-xl shadow-emerald-deep/10 backdrop-blur-md ${language === 'ur' ? 'font-urdu' : ''}`}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald/10 text-2xl text-emerald">
          ✓
        </div>
        <p className={`text-xl font-semibold leading-relaxed text-emerald-deep ${language === 'ur' ? 'leading-[2]' : 'font-display'}`}>
          {t.contact.form.success}
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className={`mt-6 text-sm font-semibold text-gold transition-colors hover:text-emerald ${language === 'ur' ? 'font-sans' : ''}`}
        >
          {language === 'ur' ? 'مزید پیغام بھیجیں' : 'Send another inquiry'}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="admission-form-card relative mx-auto max-w-xl overflow-hidden rounded-2xl border border-emerald/15 bg-white/85 p-6 shadow-xl shadow-emerald-deep/10 backdrop-blur-md md:p-8"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-emerald/10 blur-3xl" />

      <div className="relative">
        {submitError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className={`text-sm text-red-700 ${language === 'ur' ? 'font-urdu text-right leading-[2]' : ''}`}>{t.contact.form.error}</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className={language === 'ur' ? 'text-right' : 'text-left'}>
            <FormLabel htmlFor="contact-name" label={t.contact.form.name} language={language} required />
            <input
              id="contact-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass}
              placeholder="Your full name"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div className={language === 'ur' ? 'text-right' : 'text-left'}>
            <FormLabel htmlFor="contact-whatsapp" label={t.contact.form.whatsapp} language={language} required />
            <input
              id="contact-whatsapp"
              type="tel"
              required
              value={form.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)}
              className={inputClass}
              placeholder="+92 300 0000000"
            />
            {errors.whatsapp && <p className="mt-1 text-xs text-red-600">{errors.whatsapp}</p>}
          </div>

          <div className={`md:col-span-2 ${language === 'ur' ? 'text-right' : 'text-left'}`}>
            <FormLabel htmlFor="contact-email" label={t.contact.form.email} language={language} required />
            <input
              id="contact-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputClass}
              placeholder="you@email.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div className={`md:col-span-2 ${language === 'ur' ? 'text-right' : 'text-left'}`}>
            <FormLabel htmlFor="contact-message" label={t.contact.form.message} language={language} />
            <textarea
              id="contact-message"
              rows={3}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Write your message or inquiry here..."
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

        <div className="mt-6 flex flex-col items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-full bg-emerald px-8 py-3.5 text-sm font-semibold tracking-wide text-cream shadow-lg shadow-emerald/25 transition-all duration-300 hover:bg-emerald-light hover:shadow-emerald/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[260px] ${language === 'ur' ? 'font-urdu' : ''}`}
          >
            {loading ? (language === 'ur' ? "بھیج رہا ہے..." : "Sending...") : t.contact.form.submit}
          </button>
        </div>
      </div>
    </form>
  );
}
