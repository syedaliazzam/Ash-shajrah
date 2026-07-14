"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  CAREER_SOURCES,
  CAREER_STATUSES,
  INTERESTED_ROLE_OPTIONS,
  type CareerStatus,
} from "@/lib/careers";
import type { AdminCareerApplication } from "@/lib/career-db";

export default function LmsAdminCareersPage() {
  const { language, t } = useLanguage();
  const isUrdu = language === "ur";
  const a = t.lms.admin;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [applications, setApplications] = useState<AdminCareerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [source, setSource] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminCareerApplication | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/admin/session");
    if (!res.ok) {
      setAuthed(false);
      router.replace("/lms/admin/login");
      return false;
    }
    setAuthed(true);
    return true;
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (role) params.set("interestedRole", role);
      if (source) params.set("source", source);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/careers?${params.toString()}`);
      if (res.status === 401) {
        router.replace("/lms/admin/login");
        return;
      }
      const data = (await res.json()) as {
        applications?: AdminCareerApplication[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error || a.loadError);
        return;
      }
      setApplications(data.applications || []);
    } catch {
      setError(a.loadError);
    } finally {
      setLoading(false);
    }
  }, [a.loadError, role, router, search, source, status]);

  useEffect(() => {
    void (async () => {
      const ok = await checkAuth();
      if (ok) await load();
    })();
  }, [checkAuth, load]);

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id || applications.length === 0) return;
    const found = applications.find((item) => item.id === id);
    if (found) {
      setSelected(found);
      setNotes(found.adminNotes || "");
    }
  }, [applications, searchParams]);

  const statusLabel = useMemo(() => {
    return {
      new: a.statusNew,
      reviewed: a.statusReviewed,
      shortlisted: a.statusShortlisted,
      rejected: a.statusRejected,
      archived: a.statusArchived,
    } as Record<string, string>;
  }, [a]);

  async function updateApplication(patch: {
    status?: CareerStatus;
    adminNotes?: string | null;
  }) {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/careers/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.status === 401) {
        router.replace("/lms/admin/login");
        return;
      }
      const data = (await res.json()) as { application?: AdminCareerApplication };
      if (data.application) {
        setSelected(data.application);
        setNotes(data.application.adminNotes || "");
        setApplications((prev) =>
          prev.map((item) =>
            item.id === data.application!.id ? data.application! : item
          )
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/lms/admin/login");
  }

  if (authed === null || authed === false) {
    return (
      <p className={`text-sm text-emerald-deep/60 ${isUrdu ? "font-urdu" : ""}`}>
        {a.checkingAuth}
      </p>
    );
  }

  return (
    <div dir={isUrdu ? "rtl" : "ltr"} lang={isUrdu ? "ur" : "en"}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            className={`text-2xl font-bold text-emerald-deep sm:text-3xl ${
              isUrdu ? "font-urdu leading-[1.7]" : "font-display"
            }`}
          >
            {a.careersTitle}
          </h1>
          <p className={`mt-1 text-sm text-emerald-deep/65 ${isUrdu ? "font-urdu" : ""}`}>
            {a.careersSubtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className={`rounded-full border border-emerald/15 bg-white px-4 py-2 text-sm font-semibold ${isUrdu ? "font-urdu" : ""}`}
        >
          {a.logout}
        </button>
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl border border-emerald/10 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={a.searchPlaceholder}
          className="rounded-xl border border-emerald/15 px-3 py-2.5 text-sm outline-none focus:border-emerald/40 sm:col-span-2 lg:col-span-1"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-emerald/15 px-3 py-2.5 text-sm"
        >
          <option value="">{a.allStatuses}</option>
          {CAREER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel[s] || s}
            </option>
          ))}
        </select>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-xl border border-emerald/15 px-3 py-2.5 text-sm"
        >
          <option value="">{a.allRoles}</option>
          {INTERESTED_ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {isUrdu ? r.ur : r.en}
            </option>
          ))}
        </select>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="rounded-xl border border-emerald/15 px-3 py-2.5 text-sm"
        >
          <option value="">{a.allSources}</option>
          {CAREER_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void load()}
          className={`rounded-full bg-emerald px-4 py-2.5 text-sm font-semibold text-cream sm:col-span-2 lg:col-span-4 lg:justify-self-start ${isUrdu ? "font-urdu" : ""}`}
        >
          {a.applyFilters}
        </button>
      </div>

      {error && (
        <p className={`mt-4 text-sm text-red-600 ${isUrdu ? "font-urdu" : ""}`}>{error}</p>
      )}

      {loading ? (
        <p className={`mt-6 text-sm text-emerald-deep/60 ${isUrdu ? "font-urdu" : ""}`}>
          {a.loading}
        </p>
      ) : applications.length === 0 ? (
        <p className={`mt-6 text-sm text-emerald-deep/60 ${isUrdu ? "font-urdu" : ""}`}>
          {a.empty}
        </p>
      ) : (
        <>
          <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-emerald/10 bg-white md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-emerald/10 bg-cream/70 text-emerald-deep/70">
                <tr>
                  <th className="px-4 py-3 font-semibold">{a.cols.submittedAt}</th>
                  <th className="px-4 py-3 font-semibold">{a.cols.name}</th>
                  <th className="px-4 py-3 font-semibold">{a.cols.email}</th>
                  <th className="px-4 py-3 font-semibold">{a.cols.whatsapp}</th>
                  <th className="px-4 py-3 font-semibold">{a.cols.role}</th>
                  <th className="px-4 py-3 font-semibold">{a.cols.source}</th>
                  <th className="px-4 py-3 font-semibold">{a.cols.status}</th>
                  <th className="px-4 py-3 font-semibold">{a.cols.resume}</th>
                  <th className="px-4 py-3 font-semibold">{a.cols.actions}</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((item) => (
                  <tr key={item.id} className="border-b border-emerald/5 align-top">
                    <td className="whitespace-nowrap px-4 py-3" dir="ltr">
                      {new Date(item.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium">{item.fullName}</td>
                    <td className="px-4 py-3" dir="ltr">
                      {item.email}
                    </td>
                    <td className="px-4 py-3" dir="ltr">
                      {item.whatsapp}
                    </td>
                    <td className="px-4 py-3">{item.interestedRole}</td>
                    <td className="px-4 py-3">{item.source}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald/10 px-2.5 py-1 text-xs font-semibold">
                        {statusLabel[item.status] || item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={item.resumeAccessPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald underline-offset-2 hover:underline"
                      >
                        {a.viewResume}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(item);
                          setNotes(item.adminNotes || "");
                        }}
                        className="rounded-full border border-emerald/15 px-3 py-1.5 text-xs font-semibold"
                      >
                        {a.open}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-3 md:hidden">
            {applications.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-emerald/10 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-emerald-deep">{item.fullName}</h3>
                    <p className="mt-1 text-xs text-emerald-deep/55" dir="ltr">
                      {new Date(item.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald/10 px-2.5 py-1 text-xs font-semibold">
                    {statusLabel[item.status] || item.status}
                  </span>
                </div>
                <dl className="mt-3 space-y-1 text-sm">
                  <div>
                    <dt className="inline text-emerald-deep/55">{a.cols.email}: </dt>
                    <dd className="inline" dir="ltr">
                      {item.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-emerald-deep/55">{a.cols.whatsapp}: </dt>
                    <dd className="inline" dir="ltr">
                      {item.whatsapp}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-emerald-deep/55">{a.cols.role}: </dt>
                    <dd className="inline">{item.interestedRole}</dd>
                  </div>
                  <div>
                    <dt className="inline text-emerald-deep/55">{a.cols.source}: </dt>
                    <dd className="inline">{item.source}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={item.resumeAccessPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-emerald/15 px-3 py-1.5 text-xs font-semibold"
                  >
                    {a.viewResume}
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(item);
                      setNotes(item.adminNotes || "");
                    }}
                    className="rounded-full bg-emerald px-3 py-1.5 text-xs font-semibold text-cream"
                  >
                    {a.open}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-emerald-deep/50 p-4 sm:items-center">
          <div
            className="absolute inset-0"
            onClick={() => setSelected(null)}
            aria-hidden
          />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  className={`text-xl font-bold text-emerald-deep ${
                    isUrdu ? "font-urdu" : "font-display"
                  }`}
                >
                  {selected.fullName}
                </h2>
                <p className="mt-1 text-sm text-emerald-deep/60" dir="ltr">
                  {new Date(selected.submittedAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full bg-cream px-3 py-1.5 text-sm font-semibold"
              >
                {a.close}
              </button>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              {[
                [a.cols.email, selected.email],
                [a.cols.whatsapp, selected.whatsapp],
                [a.cols.role, selected.interestedRole],
                [a.cols.source, selected.source],
                [a.resumeFile, selected.resumeFileName],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-deep/50">
                    {label}
                  </dt>
                  <dd className="mt-1 break-words text-emerald-deep" dir="auto">
                    {value}
                  </dd>
                </div>
              ))}
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-deep/50">
                  {a.message}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-emerald-deep">
                  {selected.message || "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={selected.resumeAccessPath}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-cream"
              >
                {a.viewResume}
              </a>
              <a
                href={`${selected.resumeAccessPath}?download=1`}
                className="rounded-full border border-emerald/15 px-4 py-2 text-sm font-semibold"
              >
                {a.downloadResume}
              </a>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                {a.cols.status}
                <select
                  value={selected.status}
                  onChange={(e) =>
                    void updateApplication({ status: e.target.value as CareerStatus })
                  }
                  className="mt-1.5 w-full rounded-xl border border-emerald/15 px-3 py-2.5 text-sm"
                  disabled={saving}
                >
                  {CAREER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel[s] || s}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-wrap items-end gap-2">
                {(
                  ["reviewed", "shortlisted", "rejected", "archived"] as CareerStatus[]
                ).map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={saving}
                    onClick={() => void updateApplication({ status: s })}
                    className="rounded-full border border-emerald/15 px-3 py-2 text-xs font-semibold disabled:opacity-50"
                  >
                    {statusLabel[s]}
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-4 block text-sm font-semibold">
              {a.adminNotes}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-1.5 w-full rounded-xl border border-emerald/15 px-3 py-2.5 text-sm"
              />
            </label>
            <button
              type="button"
              disabled={saving}
              onClick={() => void updateApplication({ adminNotes: notes })}
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-60"
            >
              {saving ? a.saving : a.saveNotes}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
