import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/shared/lib/env';

/** Keys used for JWT + user persistence in localStorage. */
export const AUTH_STORAGE_KEYS = {
  token: 'token',
  user: 'user',
} as const;

/**
 * Normalised error shape surfaced to the UI. Every rejected request resolves to this,
 * so callers never have to dig through Axios internals.
 */
export interface ApiError {
  status: number;
  message: string;
  /** Raw backend payload, when present. */
  data?: unknown;
}

function toApiError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0;
  const data = error.response?.data as { message?: string; error?: string } | undefined;
  const message =
    data?.message ||
    data?.error ||
    (status === 0 ? 'Network error — please check your connection.' : error.message) ||
    'Something went wrong.';
  return { status, message, data: error.response?.data };
}

/**
 * The single, shared Axios instance every feature/service must reuse.
 * Configured with the base URL, a request timeout, a JWT interceptor and a
 * global 401 handler that clears the session and returns the user to login.
 */
const api: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach the JWT when present.
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(toApiError(error)),
);

// Response interceptor — normalise errors and handle expired/invalid sessions.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEYS.token);
      localStorage.removeItem(AUTH_STORAGE_KEYS.user);
      // Avoid redirect loops if we're already on an auth page.
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(toApiError(error));
  },
);

/** Typed convenience wrapper that unwraps `response.data`. */
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await api.request<T>(config);
  return response.data;
}

export default api;
