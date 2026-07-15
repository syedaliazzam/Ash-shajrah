import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnvFile() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

let url = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
if (
  (url.startsWith('"') && url.endsWith('"')) ||
  (url.startsWith("'") && url.endsWith("'"))
) {
  url = url.slice(1, -1);
}

if (!url.startsWith("postgres")) {
  console.error("DIRECT_URL or DATABASE_URL is not configured.");
  process.exit(1);
}

const sql = fs.readFileSync(
  path.join(__dirname, "migrate-parent-interview-columns-to-jsonb.sql"),
  "utf8"
);

const pool = new Pool({
  connectionString: url,
  ssl: url.includes("supabase.com")
    ? { rejectUnauthorized: false }
    : undefined,
});

try {
  await pool.query(sql);
  console.log("parent_interview_forms reverted to JSONB storage");
} catch (error) {
  console.error("Failed to migrate parent_interview_forms to JSONB.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
