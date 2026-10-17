import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import {
  COOKIE_NAME,
  type AdminJwtPayload,
  signAdminToken,
  verifyAdminToken,
} from "./token";

export {
  COOKIE_NAME,
  type AdminJwtPayload,
  signAdminToken,
  verifyAdminToken,
};

/**
 * Hash a plain password with bcrypt
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

/**
 * Verify a plain password against a bcrypt hash
 */
export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

/**
 * Get the currently authenticated admin session from server components or route handlers
 */
export async function getAdminSession(): Promise<AdminJwtPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
