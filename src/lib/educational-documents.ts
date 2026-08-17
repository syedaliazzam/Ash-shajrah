import { getPgPool } from "@/lib/postgres";

export type EducationalDocument = {
  id: string;
  title: string;
  documentType: string;
  classLevel: string | null;
  fileUrl: string;
  isActive: boolean;
};

function deriveSupabaseUrlFromDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || "";
  const hostMatch = databaseUrl.match(/postgres\.([a-z0-9]+)\./i);
  if (hostMatch?.[1]) {
    return `https://${hostMatch[1]}.supabase.co`;
  }

  const userMatch = databaseUrl.match(/postgresql:\/\/postgres\.([a-z0-9]+):/i);
  if (userMatch?.[1]) {
    return `https://${userMatch[1]}.supabase.co`;
  }

  return "";
}

function resolveDocumentUrl(rawPath: string | null | undefined) {
  const value = rawPath?.trim();
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalizedPath = value.replace(/^\/+/, "");
  const encodedPath = encodeURIComponent(normalizedPath);

  return `/api/file-preview?path=${encodedPath}`;
}

export async function listEducationalDocumentsFromDb(): Promise<EducationalDocument[]> {
  const client = getPgPool();

  const result = await client.query<{
    id: string;
    title: string | null;
    document_type: string | null;
    class_level: string | null;
    file_url: string | null;
    is_active: boolean | null;
  }>(`
    select
      id,
      title,
      document_type,
      class_level,
      file_url,
      is_active
    from public.educational_documents
    where coalesce(is_active, true) = true
      and lower(trim(coalesce(document_type, ''))) = 'curriculum'
    order by title asc
  `);

  return result.rows.map((row) => ({
    id: row.id,
    title: row.title?.trim() || "Curriculum Document",
    documentType: row.document_type?.trim() || "curriculum",
    classLevel: row.class_level?.trim() || null,
    fileUrl: resolveDocumentUrl(row.file_url),
    isActive: row.is_active ?? true,
  }));
}
