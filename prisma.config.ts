// Prisma 7 config — connection URLs must not live in schema.prisma.
// Prefer DIRECT_URL (session, :5432) for migrations; fall back to DATABASE_URL.
import "dotenv/config";
import { defineConfig } from "prisma/config";

function stripQuotes(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

const migrationUrl =
  stripQuotes(process.env.DIRECT_URL) ||
  stripQuotes(process.env.DATABASE_URL);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use direct/session URL when available (Supabase :5432). Pooled :6543 can break DDL.
    url: migrationUrl,
  },
});
