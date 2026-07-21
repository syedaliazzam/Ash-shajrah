"use client";

import { FormEvent, useEffect, useState } from "react";

type PreviewResponse = {
  success: true;
  message: string;
  emailSent: boolean;
  sendWarning: string | null;
  registrationId: string;
  interviewUrl: string;
  emailText: string;
  emailHtml: string;
  registration: {
    parentName: string;
    email: string;
    childName: string;
    childDob: string;
    level: string;
    city: string;
    country: string;
  };
};

type PendingCandidate = {
  registrationId: string;
  parentName: string;
  email: string;
  childName: string;
  childAge: string;
  level: string;
  city: string;
  country: string;
};

export function ParentInterviewPreviewTool() {
  const [email, setEmail] = useState("");
  const [registrationId, setRegistrationId] = useState("");
  const [selectedRegistrationId, setSelectedRegistrationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [result, setResult] = useState<PreviewResponse | null>(null);
  const [candidates, setCandidates] = useState<PendingCandidate[]>([]);
  const [candidateLoading, setCandidateLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const gatePassword =
    process.env.NEXT_PUBLIC_PARENT_INTERVIEW_PREVIEW_PASSWORD;
  const accessStorageKey = "parent-interview-preview-access";

  const EyeIcon = ({ hidden }: { hidden?: boolean }) =>
    hidden ? (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M3 3l18 18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.2 6.2C4 7.7 2.7 10 2 12c1.4 4.1 5.1 7 10 7 1.5 0 2.9-.2 4.1-.7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.8 5.1c3.4.9 6 3.8 7.2 6.9-.4 1.2-1 2.4-1.8 3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

  async function loadCandidates() {
    setCandidateLoading(true);
    try {
      const response = await fetch("/api/parent-interview-preview/pending-registrations", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok || !data.candidates) return;
      setCandidates(data.candidates as PendingCandidate[]);
    } catch {
      // Keep the manual email input available if the list cannot load.
    } finally {
      setCandidateLoading(false);
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAccessGranted(sessionStorage.getItem(accessStorageKey) === "true");
    }

    void loadCandidates();
  }, []);

  function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    if (password.trim() === gatePassword) {
      setAccessGranted(true);
      sessionStorage.setItem(accessStorageKey, "true");
      setPasswordError("");
      return;
    }
    setPasswordError("Incorrect password. Please try again.");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");
    setResult(null);

    try {
      const response = await fetch("/api/parent-interview-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          registrationId: registrationId || selectedRegistrationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to generate preview.");
        return;
      }

      setResult(data as PreviewResponse);
      setSuccessMessage(
        (data as PreviewResponse).message || "Email sent successfully."
      );
      setRegistrationId("");
      setSelectedRegistrationId("");
      setEmail("");
      void loadCandidates();
    } catch {
      setError("Unable to generate preview.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f3ebd4_0%,#faf7f0_40%,#f5efe3_100%)] px-4 py-10 text-emerald-deep sm:px-6">
      <div className="mx-auto max-w-5xl">
        {!accessGranted ? (
          <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
            <div className="w-full rounded-[28px] border border-emerald/10 bg-white/95 p-8 shadow-[0_24px_80px_rgba(13,59,46,0.12)]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">
                Access Required
              </p>
              <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
                Kindly enter password to access this page
              </h1>
              <p className="mt-4 text-sm leading-7 text-warm-brown">
                This page is protected. Enter the correct password to continue.
              </p>

              <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="page-password"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-warm-brown"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="page-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter password"
                      className="min-h-12 w-full rounded-2xl border border-emerald/15 bg-cream px-4 py-3 pr-12 text-base outline-none transition focus:border-gold focus:bg-white"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-3 my-auto flex h-8 w-8 items-center justify-center rounded-full text-warm-brown transition hover:bg-emerald/10 hover:text-emerald-deep"
                    >
                      <EyeIcon hidden={!showPassword} />
                    </button>
                  </div>
                </div>

                {passwordError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {passwordError}
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="min-h-12 w-full rounded-full bg-emerald px-5 py-3 text-sm font-semibold tracking-wide text-cream transition hover:bg-emerald-deep"
                >
                  Access Page
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
        <div className="mb-8 rounded-[28px] border border-emerald/10 bg-white/90 p-8 shadow-[0_24px_80px_rgba(13,59,46,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">
            Internal Tool
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            Parent Interview Link Preview
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-warm-brown sm:text-base">
            Enter a registration ID or parent email for an already registered
            user. This will generate or refresh that user&apos;s pending parent
            interview form link, send the email to that parent, and also show
            the same message on this page.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <section className="rounded-[28px] border border-emerald/10 bg-white/95 p-6 shadow-[0_20px_60px_rgba(13,59,46,0.06)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="existing-user-registration-id"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-warm-brown"
                >
                  Registration ID
                </label>
                <input
                  id="existing-user-registration-id"
                  type="text"
                  inputMode="numeric"
                  value={registrationId}
                  onChange={(event) => {
                    setRegistrationId(event.target.value);
                    setSelectedRegistrationId("");
                  }}
                  placeholder="Enter registration ID"
                  className="min-h-12 w-full rounded-2xl border border-emerald/15 bg-cream px-4 py-3 text-base outline-none transition focus:border-gold focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="existing-user-email"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-warm-brown"
                >
                  Registered User Email
                </label>
                <input
                  id="existing-user-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setSelectedRegistrationId("");
                  }}
                  placeholder="parent@example.com"
                  className="min-h-12 w-full rounded-2xl border border-emerald/15 bg-cream px-4 py-3 text-base outline-none transition focus:border-gold focus:bg-white"
                />
                <select
                  value={selectedRegistrationId}
                  onChange={(event) => {
                    const nextRegistrationId = event.target.value;
                    setSelectedRegistrationId(nextRegistrationId);
                    setRegistrationId(nextRegistrationId);
                    const selectedCandidate = candidates.find(
                      (candidate) => candidate.registrationId === nextRegistrationId
                    );
                    setEmail(selectedCandidate?.email || "");
                  }}
                  className="mt-3 min-h-12 w-full rounded-2xl border border-emerald/15 bg-cream px-4 py-3 text-sm outline-none transition focus:border-gold focus:bg-white"
                >
                  <option value="">
                    {candidateLoading
                      ? "Loading registrations..."
                      : "Pick from registrations"}
                  </option>
                  {candidates.map((candidate) => (
                    <option
                      key={candidate.registrationId}
                      value={candidate.registrationId}
                    >
                      {candidate.registrationId} - {candidate.parentName} - {candidate.childName} - {candidate.level}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs leading-6 text-warm-brown">
                Use either registration ID or email. If a parent has multiple
                children, registration ID is the safest option. You can also
                pick a row below to auto-fill both fields.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="min-h-12 w-full rounded-full bg-emerald px-5 py-3 text-sm font-semibold tracking-wide text-cream transition hover:bg-emerald-deep disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Generating preview..." : "Generate Interview Link"}
              </button>
            </form>

            {error ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {successMessage ? (
              <div className="mt-5 rounded-2xl border border-emerald/15 bg-emerald/5 px-4 py-3 text-sm text-emerald-deep">
                {successMessage}
              </div>
            ) : null}

            {result?.sendWarning ? (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {result.sendWarning}
              </div>
            ) : null}

            {result ? (
              <div className="mt-6 space-y-4 rounded-2xl border border-emerald/10 bg-cream-dark/60 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warm-brown">
                    Registration ID
                  </p>
                  <p className="mt-1 text-sm">{result.registrationId}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warm-brown">
                    Parent Interview Link
                  </p>
                  <a
                    href={result.interviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block break-all text-sm font-medium text-emerald underline underline-offset-4"
                  >
                    {result.interviewUrl}
                  </a>
                </div>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warm-brown">
                      Parent
                    </p>
                    <p className="mt-1">{result.registration.parentName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warm-brown">
                      Child
                    </p>
                    <p className="mt-1">{result.registration.childName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warm-brown">
                      Date of Birth
                    </p>
                    <p className="mt-1">{result.registration.childDob || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warm-brown">
                      Country / City
                    </p>
                    <p className="mt-1">
                      {result.registration.country}
                      {result.registration.city ? `, ${result.registration.city}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-[28px] border border-emerald/10 bg-white/95 p-6 shadow-[0_20px_60px_rgba(13,59,46,0.06)]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warm-brown">
                  Email Preview
                </p>
                <h2 className="mt-1 font-display text-2xl">
                  Registration confirmation with interview link
                </h2>
              </div>
            </div>

            {result ? (
              <pre className="overflow-x-auto rounded-2xl border border-emerald/10 bg-[#fffdf8] p-5 text-sm leading-7 whitespace-pre-wrap">
                {result.emailText}
              </pre>
            ) : (
              <div className="rounded-2xl border border-dashed border-emerald/20 bg-cream/70 p-8 text-sm leading-7 text-warm-brown">
                Generate a preview to see the message here.
              </div>
            )}
          </section>
        </div>
          </>
        )}
      </div>
    </main>
  );
}
