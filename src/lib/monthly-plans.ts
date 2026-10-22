import { getPgPool } from "@/lib/postgres";

export type MediaType = "image" | "video" | "pdf" | "document";

export type MonthlyPlanMediaItem = {
  id: string;
  planId: string;
  planName: string;
  monthKey: string;
  monthNameEn: string;
  monthNameUr: string;
  startDate: string;
  endDate: string;
  dateRangeLabel: { en: string; ur: string };
  rawUrl: string;
  url: string;
  mediaType: MediaType;
  title: string;
  cleanFileName: string;
};

export type MonthlyPlanGroup = {
  id: string;
  name: string;
  monthKey: string;
  monthNameEn: string;
  monthNameUr: string;
  startDate: string;
  endDate: string;
  dateRangeLabel: { en: string; ur: string };
  items: MonthlyPlanMediaItem[];
};

export type MonthlyPlansData = {
  plans: MonthlyPlanGroup[];
  allMediaItems: MonthlyPlanMediaItem[];
  months: Array<{
    key: string;
    labelEn: string;
    labelUr: string;
    count: number;
  }>;
};

type DbMonthlyPlanRow = {
  id: string;
  name: string;
  start_date: Date | string;
  end_date: Date | string;
  image_urls: string[] | null;
  created_at?: Date | string | null;
};

const MONTH_NAMES = [
  { en: "January", ur: "جنوری" },
  { en: "February", ur: "فروری" },
  { en: "March", ur: "مارچ" },
  { en: "April", ur: "اپریل" },
  { en: "May", ur: "مئی" },
  { en: "June", ur: "جون" },
  { en: "July", ur: "جولائی" },
  { en: "August", ur: "اگست" },
  { en: "September", ur: "ستمبر" },
  { en: "October", ur: "اکتوبر" },
  { en: "November", ur: "نومبر" },
  { en: "December", ur: "دسمبر" },
] as const;

function deriveSupabaseUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || "";
  const hostMatch = dbUrl.match(/postgres\.([a-z0-9]+)\./i);
  if (hostMatch?.[1]) return `https://${hostMatch[1]}.supabase.co`;

  const userMatch = dbUrl.match(/postgresql:\/\/postgres\.([a-z0-9]+):/i);
  if (userMatch?.[1]) return `https://${userMatch[1]}.supabase.co`;

  return "";
}

export function detectMediaType(pathOrUrl: string): MediaType {
  const clean = pathOrUrl.toLowerCase().split("?")[0];
  if (/\.(mp4|webm|ogg|mov|m4v|avi|mkv)$/i.test(clean)) {
    return "video";
  }
  if (/\.pdf$/i.test(clean)) {
    return "pdf";
  }
  if (/\.(png|jpe?g|webp|gif|svg|avif)$/i.test(clean)) {
    return "image";
  }
  return "document";
}

export function resolveStorageUrl(pathOrUrl: string, bucket = "ash-shajrah"): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/") && !trimmed.startsWith("/storage/")) return trimmed;

  const supabaseUrl = deriveSupabaseUrl();
  if (!supabaseUrl) return trimmed;

  // Clean path
  let path = trimmed.replace(/^\/+/, "");
  if (path.startsWith("storage/v1/object/public/")) {
    path = path.replace(/^storage\/v1\/object\/public\//, "");
  }
  if (path.startsWith(`${bucket}/`)) {
    path = path.slice(bucket.length + 1);
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

function cleanTitleFromFileName(raw: string, mediaType: MediaType): string {
  try {
    const segments = raw.split("/");
    const filename = segments[segments.length - 1] || raw;
    // Strip timestamps like 1790847256880_
    let stripped = filename.replace(/^\d{10,15}[_-]/, "");
    // Remove extension
    stripped = stripped.replace(/\.[a-zA-Z0-9]+$/, "");
    // Replace underscores and dashes
    stripped = stripped.replace(/[_-]+/g, " ").trim();

    // Remove duplicate/unfriendly keywords
    stripped = stripped.replace(/\bfees?\b/gi, "Activity");
    stripped = stripped.replace(/\badmission added\b/gi, "Curriculum");
    stripped = stripped.replace(/\btinywow\b/gi, "").trim();

    if (/whatsapp video/i.test(stripped)) {
      return "Video Demonstration & Guide";
    }
    if (/whatsapp image/i.test(stripped)) {
      return "Curriculum & Activity Sheet";
    }
    if (/screenshot/i.test(stripped)) {
      return "Curriculum Planning Material";
    }

    if (!stripped || stripped.length < 3) {
      return mediaType === "video" ? "Instructional Video" : "Curriculum Document";
    }

    // Capitalize first letters of words
    return stripped
      .split(" ")
      .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
      .join(" ");
  } catch {
    return mediaType === "video" ? "Instructional Video" : "Curriculum Document";
  }
}

function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const m = MONTH_NAMES[date.getMonth()].en.slice(0, 3);
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
}

function formatDateUr(date: Date): string {
  const d = date.getDate().toString();
  const m = MONTH_NAMES[date.getMonth()].ur;
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
}

export async function listMonthlyPlansFromDb(): Promise<MonthlyPlansData> {
  const client = getPgPool();

  const query = `
    SELECT
      id,
      name,
      start_date,
      end_date,
      image_urls,
      created_at
    FROM public.monthly_plans
    WHERE image_urls IS NOT NULL AND array_length(image_urls, 1) > 0
    ORDER BY
      CASE
        WHEN start_date <= NOW() + INTERVAL '45 days' THEN 0
        ELSE 1
      END,
      start_date DESC
  `;

  let rows: DbMonthlyPlanRow[] = [];

  try {
    const res = await client.query<DbMonthlyPlanRow>(query);
    rows = res.rows;
  } catch (err) {
    console.error("Database error in listMonthlyPlansFromDb:", err);
    rows = [];
  }

  // If no rows found in DB, return empty plans with type consistency
  if (!rows || rows.length === 0) {
    return {
      plans: [],
      allMediaItems: [],
      months: [],
    };
  }

  const plans: MonthlyPlanGroup[] = [];
  const allMediaItems: MonthlyPlanMediaItem[] = [];
  const monthMap = new Map<
    string,
    { key: string; labelEn: string; labelUr: string; count: number }
  >();

  for (const row of rows) {
    const startDate = new Date(row.start_date);
    const endDate = new Date(row.end_date);
    const validStartDate = !isNaN(startDate.getTime()) ? startDate : new Date();
    const validEndDate = !isNaN(endDate.getTime()) ? endDate : new Date();

    const monthIndex = validStartDate.getMonth();
    const year = validStartDate.getFullYear();
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    const monthNameEn = `${MONTH_NAMES[monthIndex].en} ${year}`;
    const monthNameUr = `${MONTH_NAMES[monthIndex].ur} ${year}`;

    const dateRangeLabel = {
      en: `${formatDate(validStartDate)} – ${formatDate(validEndDate)}`,
      ur: `${formatDateUr(validStartDate)} تا ${formatDateUr(validEndDate)}`,
    };

    const imageUrls = Array.isArray(row.image_urls) ? row.image_urls : [];
    const planItems: MonthlyPlanMediaItem[] = [];

    imageUrls.forEach((rawPath, idx) => {
      if (!rawPath || typeof rawPath !== "string") return;
      const cleanPath = rawPath.trim();
      if (!cleanPath) return;

      const mediaType = detectMediaType(cleanPath);
      const url = resolveStorageUrl(cleanPath);
      const title = cleanTitleFromFileName(cleanPath, mediaType);
      const segments = cleanPath.split("/");
      const cleanFileName = segments[segments.length - 1] || cleanPath;

      const item: MonthlyPlanMediaItem = {
        id: `${row.id}-${idx}`,
        planId: row.id,
        planName: row.name?.trim() || monthNameEn,
        monthKey,
        monthNameEn,
        monthNameUr,
        startDate: validStartDate.toISOString(),
        endDate: validEndDate.toISOString(),
        dateRangeLabel,
        rawUrl: cleanPath,
        url,
        mediaType,
        title,
        cleanFileName,
      };

      planItems.push(item);
      allMediaItems.push(item);
    });

    if (planItems.length > 0) {
      plans.push({
        id: row.id,
        name: row.name?.trim() || monthNameEn,
        monthKey,
        monthNameEn,
        monthNameUr,
        startDate: validStartDate.toISOString(),
        endDate: validEndDate.toISOString(),
        dateRangeLabel,
        items: planItems,
      });

      const existingMonth = monthMap.get(monthKey);
      if (existingMonth) {
        existingMonth.count += planItems.length;
      } else {
        monthMap.set(monthKey, {
          key: monthKey,
          labelEn: monthNameEn,
          labelUr: monthNameUr,
          count: planItems.length,
        });
      }
    }
  }

  const months = Array.from(monthMap.values());

  return {
    plans,
    allMediaItems,
    months,
  };
}
