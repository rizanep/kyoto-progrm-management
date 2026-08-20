import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'programhub-super-secure-jwt-production-secret-2026'
);

export const COOKIE_NAME = 'auth_session_token';

export interface AuthSessionPayload {
  userId: string;
  fullName: string;
  phone: string;
  role: string;
  orgId: string;
  orgName: string;
}

/**
 * Signs a secure, tamper-proof JWT token valid for 7 days
 */
export async function signSessionToken(payload: AuthSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT token signature and returns the decrypted payload
 */
export async function verifySessionToken(token: string): Promise<AuthSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthSessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Gets the current authenticated session on the server
 */
export async function getServerSession(): Promise<AuthSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
