"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ParentsInterviewForm } from "@/components/parents-interview/ParentsInterviewForm";
import type { ParentInterviewPublicMeta } from "@/lib/parents-interview/db";

export function ParentsInterviewPageClient({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ParentInterviewPublicMeta | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/parents-interview/${token}`);
        const data = (await res.json()) as {
          success?: boolean;
          error?: string;
          form?: ParentInterviewPublicMeta;
        };
        if (cancelled) return;
        if (!res.ok || !data.form) {
          setError(
            data.error ||
              "This Parents Interview Form link is invalid. Please check the link in your registration email or contact Ash-Shajrah Learning Hub."
          );
          return;
        }
        setMeta(data.form);
      } catch {
        if (!cancelled) {
          setError(
            "This Parents Interview Form link is invalid. Please check the link in your registration email or contact Ash-Shajrah Learning Hub."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div dir="ltr" lang="en" className="min-h-screen overflow-x-hidden bg-[#fbf7ec]">
      <main className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-8 flex justify-center">
            <BrandLogo variant="header" priority />
          </div>

          <h1 className="text-center font-display text-3xl font-bold text-emerald-950 sm:text-4xl">
            Parents Interview Form
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base leading-7 text-emerald-950/70">
            Ash-Shajrah Learning Hub — helping us understand your child’s needs
            with care and attention.
          </p>

          <div className="mt-8">
            {loading && (
              <div className="rounded-[28px] border border-emerald-900/10 bg-[#fffdf7] p-8 text-center text-emerald-950/70">
                Loading your form…
              </div>
            )}

            {!loading && error && (
              <div className="rounded-[28px] border border-red-200 bg-white p-8 text-center text-red-700">
                {error}
              </div>
            )}

            {!loading && meta && (
              <ParentsInterviewForm token={token} initialMeta={meta} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
