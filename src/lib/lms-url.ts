export function getLmsBaseUrl(): string {
  return (
    process.env.LMS_BASE_URL || "https://lms.ashshajrah.com"
  ).replace(/\/$/, "");
}

export function getLmsParentsInterviewAdminUrl(): string {
  return `${getLmsBaseUrl()}/admin/parents-interviews`;
}

export function getLmsCareersAdminUrl(applicationId?: string): string {
  const base = `${getLmsBaseUrl()}/admin/careers`;
  return applicationId ? `${base}?id=${encodeURIComponent(applicationId)}` : base;
}
