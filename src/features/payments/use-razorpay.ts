'use client';

import { useCallback } from 'react';

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, cb: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface OpenCheckoutArgs {
  keyId: string;
  orderId: string;
  amount: number;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (response: RazorpayResponse) => void;
  onDismiss?: () => void;
  onFailure?: () => void;
}

/** Loads the Razorpay checkout on demand and opens the payment modal. */
export function useRazorpay() {
  const openCheckout = useCallback(async (args: OpenCheckoutArgs) => {
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      throw new Error('Could not load the payment gateway. Please try again.');
    }
    const instance = new window.Razorpay({
      key: args.keyId,
      amount: Math.round(args.amount * 100),
      currency: 'INR',
      order_id: args.orderId,
      name: args.name ?? 'Money Audit',
      description: args.description,
      prefill: args.prefill,
      theme: { color: '#2dd4a8' },
      handler: (response) => args.onSuccess(response),
      modal: { ondismiss: () => args.onDismiss?.() },
    });
    instance.on('payment.failed', () => args.onFailure?.());
    instance.open();
  }, []);

  return { openCheckout };
}
