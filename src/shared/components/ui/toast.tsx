'use client';

import baseToast from 'react-hot-toast';

/**
 * The single toast entry point for the app, wrapping react-hot-toast so callers
 * import from one design-system location. Add variants here as the app grows.
 */
export const toast = {
  success: (message: string) => baseToast.success(message),
  error: (message: string) => baseToast.error(message),
  info: (message: string) => baseToast(message),
  loading: (message: string) => baseToast.loading(message),
  dismiss: (id?: string) => baseToast.dismiss(id),
  promise: baseToast.promise,
};

export type Toast = typeof toast;
