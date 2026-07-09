/**
 * Centralised, typed access to public environment configuration.
 * Only `NEXT_PUBLIC_*` variables are available in the browser bundle.
 */
export const env = {
  /** Base URL of the Money Audit backend API. */
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
  /** Default request timeout (ms) for the API client. */
  apiTimeoutMs: Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 20000),
  /** App display name. */
  appName: 'Money Audit',
} as const;

export type Env = typeof env;
