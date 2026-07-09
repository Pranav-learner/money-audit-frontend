import { describe, expect, it } from 'vitest';
import { decodeJwt, jwtTimeToExpiry } from './jwt';

/** Build an unsigned JWT-shaped token with the given payload. */
function makeToken(payload: Record<string, unknown>): string {
  const b64 = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.signature`;
}

describe('decodeJwt', () => {
  it('decodes the payload claims', () => {
    const token = makeToken({ sub: 'a@b.com', exp: 1893456000, iat: 1700000000 });
    const payload = decodeJwt(token);
    expect(payload?.sub).toBe('a@b.com');
    expect(payload?.exp).toBe(1893456000);
  });

  it('returns null for malformed or empty tokens', () => {
    expect(decodeJwt(null)).toBeNull();
    expect(decodeJwt('not-a-jwt')).toBeNull();
    expect(decodeJwt('')).toBeNull();
  });
});

describe('jwtTimeToExpiry', () => {
  it('is positive for a future expiry', () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    expect(jwtTimeToExpiry(makeToken({ exp: future }))!).toBeGreaterThan(0);
  });

  it('is negative for a past expiry', () => {
    const past = Math.floor(Date.now() / 1000) - 3600;
    expect(jwtTimeToExpiry(makeToken({ exp: past }))!).toBeLessThan(0);
  });

  it('is null when no exp claim exists', () => {
    expect(jwtTimeToExpiry(makeToken({ sub: 'x' }))).toBeNull();
  });
});
