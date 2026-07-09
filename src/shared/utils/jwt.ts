/** Minimal, dependency-free JWT payload decoder (no signature verification). */
export interface JwtPayload {
  sub?: string;
  iat?: number;
  exp?: number;
  [claim: string]: unknown;
}

export function decodeJwt(token: string | null | undefined): JwtPayload | null {
  if (!token) return null;
  const part = token.split('.')[1];
  if (!part) return null;
  try {
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Milliseconds until the token expires, or null if unknown. Negative = expired. */
export function jwtTimeToExpiry(token: string | null | undefined): number | null {
  const payload = decodeJwt(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000 - Date.now();
}
