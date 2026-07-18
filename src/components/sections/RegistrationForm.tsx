"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  CHILD_AGE_OPTIONS,
  validateRegistrationForm,
  PROGRAMME_LEVELS,
  type RegistrationFormData,
  type RegistrationFormErrors,
} from "@/lib/register-form";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  COUNTRY_CITY_OPTIONS,
  CITY_COUNTRY_OPTIONS,
  COUNTRY_LIST,
  getPhoneLocalDigitsForCode,
  PHONE_COUNTRY_CODES,
} from "@/lib/registration-options";

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
  "form-input min-h-12 w-full max-w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-cream outline-none transition-all duration-300 placeholder:text-cream/30 focus:border-gold focus:bg-white/15 focus:shadow-[0_0_0_3px_rgba(201,162,39,0.15)]";

const selectClass =
  "form-select min-h-12 w-full max-w-full rounded-xl border border-white/20 bg-emerald-deep px-4 py-3 text-base text-cream outline-none transition-all duration-300 focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,162,39,0.15)]";

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
  const [phoneCountryCode, setPhoneCountryCode] = useState("+92");
  const [phoneLocalNumber, setPhoneLocalNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("Pakistan");
  const [selectedCity, setSelectedCity] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [errors, setErrors] = useState<RegistrationFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const phoneLocalDigits = getPhoneLocalDigitsForCode(phoneCountryCode);
  const countryOptions = COUNTRY_LIST;

  useEffect(() => {
    let cancelled = false;

    const loadCities = async () => {
      if (!selectedCountry) {
        setAvailableCities([]);
        return;
      }

      setCityLoading(true);

      try {
        const response = await fetch(
          `/api/cities?country=${encodeURIComponent(selectedCountry)}`,
          { cache: "no-store" }
        );
        const data = (await response.json()) as { cities?: string[] };
        const cities = Array.isArray(data.cities) ? data.cities : [];

        if (!cancelled) {
          setAvailableCities(cities);
          if (selectedCity && !cities.includes(selectedCity)) {
            setSelectedCity("");
            setForm((prev) => ({ ...prev, cityCountry: "" }));
          }
        }
      } catch {
        if (!cancelled) {
          const record = COUNTRY_CITY_OPTIONS as Record<string, readonly string[]>;
          const custom = record[selectedCountry];
          const fallback = custom?.length
            ? [...custom]
            : CITY_COUNTRY_OPTIONS.filter((entry) => entry.endsWith(`, ${selectedCountry}`)).map((entry) => entry.split(",")[0].trim());
          setAvailableCities(fallback);
        }
      } finally {
        if (!cancelled) setCityLoading(false);
      }
    };

    void loadCities();

    return () => {
      cancelled = true;
    };
  }, [selectedCountry]);

  const update = (field: keyof RegistrationFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError("");
  };

  const updateWhatsapp = (countryCode: string, localNumber: string) => {
    const maxDigits = getPhoneLocalDigitsForCode(countryCode);
    const sanitizedNumber = localNumber.replace(/\D/g, "").slice(0, maxDigits);
    setPhoneCountryCode(countryCode);
    setPhoneLocalNumber(sanitizedNumber);
    update("whatsapp", sanitizedNumber ? `${countryCode} ${sanitizedNumber}` : "");
  };

  const handleCountryChange = (country: string) => {
    const nextCountry = country || "Pakistan";
    setSelectedCountry(nextCountry);
    setSelectedCity("");
    update("cityCountry", "");
  };

  const handleCityChange = (city: string) => {
    const nextCity = city.trim();
    setSelectedCity(nextCity);
    update("cityCountry", nextCity ? `${nextCity}, ${selectedCountry}` : "");
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
      setPhoneCountryCode("+92");
      setPhoneLocalNumber("");
      setSelectedCountry("Pakistan");
      setSelectedCity("");
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
            <p className={`text-sm font-medium text-red-200 ${language === 'ur' ? 'font-urdu leading-[2]' : ''}`}>{submitError}</p>
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
            <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(140px,20%)_minmax(0,80%)]">
              <select
                id="whatsapp-country-code"
                value={phoneCountryCode}
                onChange={(e) => updateWhatsapp(e.target.value, phoneLocalNumber)}
                className={`${selectClass} min-w-0 w-full text-center ${language === "ur" ? "text-right" : "text-left"}`}
              >
                {PHONE_COUNTRY_CODES.map((option) => (
                  <option key={`${option.code}-${option.label}`} value={option.code} className="text-[#0d3b2e] bg-cream">
                    {option.code}
                  </option>
                ))}
              </select>
              <div className="relative min-w-0 overflow-hidden rounded-xl border border-white/20 bg-white/10 focus-within:border-gold focus-within:bg-white/15 focus-within:shadow-[0_0_0_3px_rgba(201,162,39,0.15)]">
                <input
                  id="whatsapp"
                  type="tel"
                  required
                  dir="ltr"
                  inputMode="numeric"
                  value={phoneLocalNumber}
                  onChange={(e) => updateWhatsapp(phoneCountryCode, e.target.value)}
                  maxLength={phoneLocalDigits}
                  className={`w-full min-w-0 border-0 bg-transparent px-4 py-3 text-base text-cream outline-none placeholder:text-cream/30 ${language === "ur" ? "text-right placeholder:text-right" : "text-left"}`}
                  placeholder={`Enter ${phoneLocalDigits} digits`}
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-cream/80">
              Remaining digits: {Math.max(phoneLocalDigits - phoneLocalNumber.length, 0)} / {phoneLocalDigits}
            </p>
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
              onChange={(e) => update("email", e.target.value.toLowerCase())}
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
            <select
              id="childAge"
              required
              dir="ltr"
              value={form.childAge}
              onChange={(e) => update("childAge", e.target.value)}
              className={`${selectClass} ${language === "ur" ? "text-right" : "text-left"}`}
            >
              <option value="" className="text-[#0d3b2e] bg-cream">
                Select age
              </option>
              {CHILD_AGE_OPTIONS.map((age) => (
                <option key={age} value={age} className="text-[#0d3b2e] bg-cream">
                  {age}
                </option>
              ))}
            </select>
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
            <FormLabel htmlFor="cityCountry" label="Country / City" language={language} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                id="cityCountry-country"
                required
                dir={language === "ur" ? "rtl" : "ltr"}
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className={`${selectClass} ${language === "ur" ? "text-right font-urdu" : "text-left"}`}
              >
                <option value="" className="text-[#0d3b2e] bg-cream">Select a country</option>
                {countryOptions.map((country) => (
                  <option key={country} value={country} className="text-[#0d3b2e] bg-cream">
                    {country}
                  </option>
                ))}
              </select>
              <select
                id="cityCountry-city"
                required
                dir={language === "ur" ? "rtl" : "ltr"}
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className={`${selectClass} ${language === "ur" ? "text-right font-urdu" : "text-left"}`}
                disabled={cityLoading}
              >
                <option value="" disabled className="text-[#0d3b2e] bg-cream">
                  {cityLoading ? "Loading cities..." : "Select a city"}
                </option>
                {availableCities.map((city) => (
                  <option key={`${selectedCountry}-${city}`} value={city} className="text-[#0d3b2e] bg-cream">
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-2 text-xs text-cream/80">
              {cityLoading
                ? "Loading cities for the selected country..."
                : availableCities.length > 0
                  ? "Please select a city to continue."
                  : "No cities loaded yet for this country."}
            </p>
            {errors.cityCountry && <p className="mt-1 text-xs text-red-300">{errors.cityCountry}</p>}
          </div>

          {/* Message */}
          <div className={`md:col-span-2 ${language === 'ur' ? 'text-right' : 'text-left'}`}>
            <FormLabel htmlFor="message" label={t.register.form.message} language={language} required />
            <textarea
              id="message"
              rows={3}
              required
              dir={language === "ur" ? "rtl" : "ltr"}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              className={`${inputClass} resize-none ${language === "ur" ? "text-right font-urdu placeholder:text-right" : "text-left"}`}
              placeholder={t.register.form.placeholders.message}
            />
            {errors.message && <p className="mt-1 text-xs text-red-300">{errors.message}</p>}
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
            className={`min-h-12 w-full rounded-full bg-gold px-8 py-3.5 text-sm font-semibold tracking-wide text-[#0d3b2e] shadow-lg shadow-gold/25 transition-all duration-300 hover:bg-gold-soft hover:shadow-gold/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[280px] ${language === 'ur' ? 'font-urdu' : ''}`}
          >
            {loading ? (language === 'ur' ? "جمع کر رہا ہے..." : "Submitting...") : t.register.form.submit}
          </button>
        </div>
      </div>
    </form>
  );
}
