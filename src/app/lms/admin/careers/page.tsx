import { Suspense } from "react";
import LmsAdminCareersPage from "./AdminCareersClient";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-emerald-deep/60">Loading…</p>}>
      <LmsAdminCareersPage />
    </Suspense>
  );
}
