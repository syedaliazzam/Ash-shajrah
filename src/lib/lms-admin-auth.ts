import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const LMS_ADMIN_COOKIE = "ash_lms_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function getAdminPassword() {
  return process.env.LMS_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "";
}

function getSessionSecret() {
  return (
    process.env.LMS_ADMIN_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    getAdminPassword() ||
    "dev-insecure-lms-admin-secret"
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );
  return toHex(signature);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export async function createAdminSessionToken(): Promise<string> {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `admin:${exp}`;
  return `${payload}.${await sign(payload)}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = await sign(payload);
  if (!timingSafeEqualHex(signature, expected)) return false;

  const [, expRaw] = payload.split(":");
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  return true;
}

export function validateAdminPassword(password: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  if (password.length !== expected.length) return false;
  let out = 0;
  for (let i = 0; i < password.length; i += 1) {
    out |= password.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return out === 0;
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(getAdminPassword());
}

export async function requireAdminSession(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(LMS_ADMIN_COOKIE)?.value);
}

export async function requireAdminFromRequest(
  request: NextRequest
): Promise<boolean> {
  return verifyAdminSessionToken(request.cookies.get(LMS_ADMIN_COOKIE)?.value);
}

export async function setAdminSessionCookie(response: NextResponse) {
  response.cookies.set(LMS_ADMIN_COOKIE, await createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(LMS_ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
