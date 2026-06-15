"use client";

import { useState, FormEvent } from "react";
import {
  validateContactForm,
  type ContactFormData,
  type ContactFormErrors,
} from "@/lib/contact-form";

const INITIAL: ContactFormData = {
  name: "",
  whatsapp: "",
  email: "",
  message: "",
  website: "",
};

const inputClass =
  "form-input w-full rounded-xl border border-emerald/15 bg-white/90 px-4 py-2.5 text-sm text-emerald-deep outline-none transition-all duration-300 placeholder:text-emerald/35 focus:border-emerald focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,138,106,0.12)]";

const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-emerald/70";

export function AdmissionForm() {
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
        body: JSON.stringify(form),
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
      <div className="admission-form-card mx-auto max-w-xl rounded-2xl border border-emerald/15 bg-white/85 p-8 text-center shadow-xl shadow-emerald-deep/10 backdrop-blur-md">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald/10 text-2xl text-emerald">
          ✓
        </div>
        <p className="font-display text-xl font-semibold leading-relaxed text-emerald-deep">
          Thank you! Your inquiry has been sent successfully.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-6 text-sm font-semibold text-gold transition-colors hover:text-emerald"
        >
          Send another inquiry
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
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="name" className={labelClass}>
              Name <span className="text-gold">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass}
              placeholder="Your full name"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="whatsapp" className={labelClass}>
              WhatsApp Number <span className="text-gold">*</span>
            </label>
            <input
              id="whatsapp"
              type="tel"
              required
              value={form.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)}
              className={inputClass}
              placeholder="+92 300 0000000"
            />
            {errors.whatsapp && (
              <p className="mt-1 text-xs text-red-600">{errors.whatsapp}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="email" className={labelClass}>
              Email Address <span className="text-gold">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputClass}
              placeholder="you@email.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="message" className={labelClass}>
              Message
            </label>
            <textarea
              id="message"
              rows={3}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Write your message or inquiry here..."
            />
          </div>
        </div>

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

        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-emerald px-8 py-3.5 text-sm font-semibold tracking-wide text-cream shadow-lg shadow-emerald/25 transition-all duration-300 hover:bg-emerald-light hover:shadow-emerald/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[220px]"
          >
            {loading ? "Sending..." : "Send Inquiry"}
          </button>
        </div>
      </div>
    </form>
  );
}
