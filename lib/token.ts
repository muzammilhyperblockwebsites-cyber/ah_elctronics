import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "ah_admin_token";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "ah_electronics_super_secure_jwt_secret_key_2026_x89f";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export interface AdminJwtPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Sign a JWT token valid for 7 days
 */
export async function signAdminToken(payload: AdminJwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT token using jose
 */
export async function verifyAdminToken(token: string): Promise<AdminJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: String(payload.id),
      email: String(payload.email),
      name: String(payload.name),
      role: String(payload.role),
    };
  } catch {
    return null;
  }
}
