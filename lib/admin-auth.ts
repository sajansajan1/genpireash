import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-key-change-in-production");

export interface AdminSession {
  email: string;
  isAdmin: boolean;
  exp: number;
}

export async function createAdminSession(email: string): Promise<string> {
  const token = await new SignJWT({ email, isAdmin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(JWT_SECRET);

  return token;
}

export async function verifyAdminSession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as AdminSession;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (!token) return null;

  return verifyAdminSession(token);
}

export function setAdminSessionCookie(response: NextResponse, token: string) {
  response.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.delete("admin_session");
}

export function validateAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL || "admin5120@genpire.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin5120";

  return email === adminEmail && password === adminPassword;
}
