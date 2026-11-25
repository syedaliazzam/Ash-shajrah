import { getPgPool } from "@/lib/postgres";

export type TrainingSessionVideo = {
  id: string;
  documentId: string;
  documentTitle: string;
  documentDescription: string | null;
  videoTitle: string;
  docDate: string;
  rawUrl: string;
  url: string;
  originalName: string | null;
  mediaType: "video" | "image";
};

function deriveSupabaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || "";
  const hostMatch = dbUrl.match(/postgres\.([a-z0-9]+)\./i);
  if (hostMatch?.[1]) return `https://${hostMatch[1]}.supabase.co`;

  const userMatch = dbUrl.match(/postgresql:\/\/postgres\.([a-z0-9]+):/i);
  if (userMatch?.[1]) return `https://${userMatch[1]}.supabase.co`;

  return "";
}

export function resolveStorageUrl(pathOrUrl: string, bucket = "ash-shajrah"): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/") && !trimmed.startsWith("/storage/")) return trimmed;

  const supabaseUrl = deriveSupabaseUrl();
  if (!supabaseUrl) return trimmed;

  let path = trimmed.replace(/^\/+/, "");
  if (path.startsWith("storage/v1/object/public/")) {
    path = path.replace(/^storage\/v1\/object\/public\//, "");
  }
  if (path.startsWith(`${bucket}/`)) {
    path = path.slice(bucket.length + 1);
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export function cleanVideoTitle(originalName: string | null, rawPath: string, docTitle: string): string {
  const source = originalName?.trim() || rawPath.split("/").pop() || "";
  let clean = source.replace(/^\d{10,15}[_-]/, "");
  clean = clean.replace(/\.[a-zA-Z0-9]+$/, "");
  clean = clean.replace(/[_-]+/g, " ").trim();

  if (clean && clean.length > 1 && !/^video$/i.test(clean)) {
    return clean
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  return docTitle || "Training Session";
}

export function isImageFile(
  fileType: string | null,
  fileUrl: string,
  originalName: string | null
): boolean {
  const normType = (fileType || "").toLowerCase().trim();
  if (["image", "img", "photo", "picture"].includes(normType)) return true;

  const path = (originalName || fileUrl || "").toLowerCase().trim();
  return /\.(jpe?g|png|webp|gif|svg|avif|bmp|tiff?)($|\?)/i.test(path);
}

export async function listTrainingSessionVideosFromDb(): Promise<TrainingSessionVideo[]> {
  const client = getPgPool();

  const query = `
    SELECT
      f.id AS file_id,
      f.file_url,
      f.file_type,
      f.original_name,
      d.id AS document_id,
      d.title AS document_title,
      d.description AS document_description,
      d.doc_date,
      d.created_at
    FROM public.library_document_files f
    JOIN public.library_documents d ON f.library_document_id = d.id
    WHERE coalesce(d.status, 'active') = 'active'
      AND (
        lower(trim(d.title)) LIKE '%training session%'
        OR lower(trim(d.title)) LIKE '%training%'
        OR lower(trim(d.title)) LIKE '%traning%'
      )
      AND (
        f.file_type IN ('video', 'image')
        OR lower(f.file_url) LIKE '%.mp4'
        OR lower(f.file_url) LIKE '%.webm'
        OR lower(f.file_url) LIKE '%.mov'
        OR lower(f.file_url) LIKE '%.m4v'
        OR lower(f.file_url) LIKE '%.jpg'
        OR lower(f.file_url) LIKE '%.jpeg'
        OR lower(f.file_url) LIKE '%.png'
        OR lower(f.file_url) LIKE '%.webp'
        OR lower(f.file_url) LIKE '%.gif'
        OR lower(coalesce(f.original_name, '')) LIKE '%.mp4'
        OR lower(coalesce(f.original_name, '')) LIKE '%.webm'
        OR lower(coalesce(f.original_name, '')) LIKE '%.mov'
        OR lower(coalesce(f.original_name, '')) LIKE '%.jpg'
        OR lower(coalesce(f.original_name, '')) LIKE '%.jpeg'
        OR lower(coalesce(f.original_name, '')) LIKE '%.png'
        OR lower(coalesce(f.original_name, '')) LIKE '%.webp'
      )
    ORDER BY d.doc_date DESC, f.created_at DESC
  `;

  const result = await client.query<{
    file_id: string;
    file_url: string | null;
    file_type: string | null;
    original_name: string | null;
    document_id: string;
    document_title: string | null;
    document_description: string | null;
    doc_date: Date | string | null;
    created_at: Date | string | null;
  }>(query);

  return result.rows
    .map((row) => {
      const rawUrl = row.file_url?.trim() || "";
      if (!rawUrl) return null;

      const docTitle = row.document_title?.trim() || "Training Sessions";
      const resolvedUrl = resolveStorageUrl(rawUrl);
      const title = cleanVideoTitle(row.original_name, rawUrl, docTitle);
      const mediaType: "video" | "image" = isImageFile(row.file_type, rawUrl, row.original_name)
        ? "image"
        : "video";

      const d = row.doc_date ? new Date(row.doc_date) : new Date();
      const docDateStr = !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "";

      return {
        id: row.file_id,
        documentId: row.document_id,
        documentTitle: docTitle,
        documentDescription: row.document_description?.trim() || null,
        videoTitle: title,
        docDate: docDateStr,
        rawUrl,
        url: resolvedUrl,
        originalName: row.original_name?.trim() || null,
        mediaType,
      };
    })
    .filter((v): v is TrainingSessionVideo => Boolean(v));
}
