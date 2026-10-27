import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || 'default_access_secret_key_change_in_production'
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key_change_in_production'
);

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  tokenId?: string;
  [key: string]: unknown;
}

// ----------------------------------------------------
// Password Hashing (bcryptjs)
// ----------------------------------------------------
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ----------------------------------------------------
// JWT Sign & Verify (jose)
// ----------------------------------------------------
export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: TokenPayload, tokenId: string): Promise<string> {
  return new SignJWT({ ...payload, tokenId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// Cookies Management (Next.js App Router)
// ----------------------------------------------------
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  try {
    const cookieStore = await cookies();

    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutos
    });

    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 días
    });
  } catch {
    // Si se ejecuta fuera del scope de Next.js
  }
}

export async function clearAuthCookies() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
  } catch {
    // Si se ejecuta fuera del scope de Next.js
  }
}

// ----------------------------------------------------
// Session Retrieval Helper
// ----------------------------------------------------
export async function getSession(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return null;
    }

    return verifyAccessToken(token);
  } catch {
    return null;
  }
}
