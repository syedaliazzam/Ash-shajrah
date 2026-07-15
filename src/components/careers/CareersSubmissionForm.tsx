"use client";

import { FormEvent, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  INTERESTED_ROLE_OPTIONS,
  MAX_RESUME_BYTES,
  type CareerSource,
} from "@/lib/careers";

type Props = {
  source: CareerSource;
  variant?: "website" | "lms";
};

export function CareersSubmissionForm({ source, variant = "website" }: Props) {
  const { language, t } = useLanguage();
  const isUrdu = language === "ur";
  const c = t.careers;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [interestedRole, setInterestedRole] = useState("");
  const [message, setMessage] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLms = variant === "lms";
  const inputClass = isLms
    ? "mt-1.5 w-full rounded-xl border border-emerald/15 bg-white px-4 py-3 text-sm text-emerald-deep outline-none transition focus:border-emerald/40 focus:ring-2 focus:ring-emerald/15"
    : "mt-1.5 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-cream placeholder:text-cream/40 outline-none transition focus:border-gold/40 focus:ring-2 focus:ring-gold/20";
  // Native <option> lists often ignore parent text color — force dark readable options.
  const selectClass = isLms
    ? "mt-1.5 min-h-14 w-full rounded-xl border border-emerald/15 bg-white px-4 py-3 text-sm text-emerald-deep outline-none transition focus:border-emerald/40 focus:ring-2 focus:ring-emerald/15 [&_option]:bg-white [&_option]:text-emerald-950"
    : "mt-1.5 min-h-14 w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-base text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/40 [&_option]:bg-white [&_option]:text-emerald-950";
  const labelClass = isLms
    ? `block text-sm font-semibold text-emerald-deep ${isUrdu ? "font-urdu" : ""}`
    : `block text-sm font-semibold text-cream/90 ${isUrdu ? "font-urdu" : ""}`;
  const errorClass = `mt-1 text-xs ${isLms ? "text-red-600" : "text-red-200"} ${isUrdu ? "font-urdu" : ""}`;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setError(null);
    setSuccess(null);

    if (resume && resume.size > MAX_RESUME_BYTES) {
      setErrors({ resume: c.form.resumeTooLarge });
      setSubmitting(false);
      return;
    }

    const body = new FormData();
    body.set("fullName", fullName);
    body.set("email", email);
    body.set("whatsapp", whatsapp);
    body.set("interestedRole", interestedRole);
    body.set("message", message);
    body.set("source", source);
    body.set("website", honeypot);
    body.set("preferredLanguage", language);
    if (resume) body.set("resume", resume);

    try {
      const res = await fetch("/api/careers", { method: "POST", body });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
        errors?: Record<string, string>;
      };

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setError(data.error || c.form.error);
        return;
      }

      setSuccess(data.message || c.form.success);
      setFullName("");
      setEmail("");
      setWhatsapp("");
      setInterestedRole("");
      setMessage("");
      setResume(null);
    } catch {
      setError(c.form.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      dir={isUrdu ? "rtl" : "ltr"}
      lang={isUrdu ? "ur" : "en"}
      className={
        isLms
          ? "rounded-2xl border border-emerald/10 bg-cream/60 p-5 shadow-sm sm:p-8"
          : "rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-sm sm:p-8"
      }
      noValidate
    >
      {/* honeypot */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="careers-fullName">
            {c.form.fullName} *
          </label>
          <input
            id="careers-fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            required
            autoComplete="name"
          />
          {errors.fullName && <p className={errorClass}>{errors.fullName}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="careers-email">
            {c.form.email} *
          </label>
          <input
            id="careers-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
            autoComplete="email"
            dir="ltr"
          />
          {errors.email && <p className={errorClass}>{errors.email}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="careers-whatsapp">
            {c.form.whatsapp} *
          </label>
          <input
            id="careers-whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className={inputClass}
            required
            inputMode="tel"
            dir="ltr"
            placeholder={c.form.placeholders.whatsapp}
          />
          {errors.whatsapp && <p className={errorClass}>{errors.whatsapp}</p>}
        </div>

        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="careers-role">
            {c.form.interestedRole} *
          </label>
          <select
            id="careers-role"
            value={interestedRole}
            onChange={(e) => setInterestedRole(e.target.value)}
            className={`${selectClass} ${isUrdu ? "font-urdu" : ""}`}
            required
          >
            <option value="" className="bg-white text-emerald-950">
              {c.form.placeholders.role}
            </option>
            {INTERESTED_ROLE_OPTIONS.map((role) => (
              <option
                key={role.value}
                value={role.value}
                className="bg-white text-emerald-950"
              >
                {isUrdu ? role.ur : role.en}
              </option>
            ))}
          </select>
          {errors.interestedRole && (
            <p className={errorClass}>{errors.interestedRole}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="careers-resume">
            {c.form.resume} *
          </label>
          <input
            id="careers-resume"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setResume(e.target.files?.[0] ?? null)}
            className={`${inputClass} file:me-3 file:rounded-full file:border-0 file:bg-emerald file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-cream`}
            required
          />
          <p
            className={`mt-1.5 text-xs ${isLms ? "text-emerald-deep/60" : "text-cream/55"} ${isUrdu ? "font-urdu" : ""}`}
          >
            {c.form.resumeHint}
          </p>
          {errors.resume && <p className={errorClass}>{errors.resume}</p>}
        </div>

        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="careers-message">
            {c.form.message}
          </label>
          <textarea
            id="careers-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className={`${inputClass} resize-y`}
            placeholder={c.form.placeholders.message}
          />
        </div>
      </div>

      {success && (
        <div
          className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
            isLms
              ? "border-emerald/20 bg-emerald/10 text-emerald-deep"
              : "border-gold/30 bg-gold/10 text-cream"
          } ${isUrdu ? "font-urdu leading-[2]" : ""}`}
        >
          {success}
        </div>
      )}

      {error && (
        <div
          className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
            isLms
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-red-300/40 bg-red-500/10 text-red-100"
          } ${isUrdu ? "font-urdu leading-[2]" : ""}`}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={`mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition disabled:opacity-60 md:w-auto ${
          isLms
            ? "bg-emerald text-cream hover:bg-emerald-light"
            : "bg-gold text-emerald-deep hover:bg-gold-soft"
        } ${isUrdu ? "font-urdu" : ""}`}
      >
        {submitting ? c.form.submitting : c.form.submit}
      </button>
    </form>
  );
}
