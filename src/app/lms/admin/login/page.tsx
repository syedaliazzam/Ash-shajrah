"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LmsAdminLoginPage() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const isUrdu = language === "ur";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => {
        if (r.ok) router.replace("/lms/admin/careers");
      })
      .catch(() => {});
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error || t.lms.admin.loginError);
        return;
      }
      router.replace("/lms/admin/careers");
    } catch {
      setError(t.lms.admin.loginError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir={isUrdu ? "rtl" : "ltr"}
      className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center"
    >
      <h1
        className={`text-2xl font-bold text-emerald-deep ${
          isUrdu ? "font-urdu leading-[1.7]" : "font-display"
        }`}
      >
        {t.lms.admin.loginTitle}
      </h1>
      <p className={`mt-2 text-sm text-emerald-deep/70 ${isUrdu ? "font-urdu" : ""}`}>
        {t.lms.admin.loginSubtitle}
      </p>

      <form onSubmit={onSubmit} className="mt-6 rounded-2xl border border-emerald/10 bg-white p-6 shadow-sm">
        <label className={`block text-sm font-semibold ${isUrdu ? "font-urdu" : ""}`}>
          {t.lms.admin.password}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-emerald/15 px-4 py-3 text-sm outline-none focus:border-emerald/40"
            required
            dir="ltr"
          />
        </label>
        {error && (
          <p className={`mt-3 text-sm text-red-600 ${isUrdu ? "font-urdu" : ""}`}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-60 ${
            isUrdu ? "font-urdu" : ""
          }`}
        >
          {loading ? t.lms.admin.loggingIn : t.lms.admin.login}
        </button>
      </form>
    </div>
  );
}
