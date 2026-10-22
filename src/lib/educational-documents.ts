import { getPgPool } from "@/lib/postgres";

export type EducationalDocument = {
  id: string;
  title: string;
  documentType: string;
  classLevel: string | null;
  fileUrl: string;
  isActive: boolean;
};


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
      and lower(trim(coalesce(document_type, ''))) not in ('parent_guide', 'parent guide', 'parent-guide')
      and lower(trim(coalesce(document_type, ''))) not like '%parent%'
    order by created_at desc, title asc
  `);

  return result.rows.map((row) => ({
    id: row.id,
    title: row.title?.trim() || "Educational Document",
    documentType: row.document_type?.trim() || "other",
    classLevel: row.class_level?.trim() || null,
    fileUrl: resolveDocumentUrl(row.file_url),
    isActive: row.is_active ?? true,
  }));
}
