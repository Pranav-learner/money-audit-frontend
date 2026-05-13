import api from '@/lib/api';

export interface RazorpayOrderRequest {
  amount: number;
}

export interface RazorpayVerifyRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  toUserId: string;
  amount: number;
  note?: string;
}

export const createRazorpayOrder = async (amount: number): Promise<{ orderId: string }> => {
  const res = await api.post('/payments/razorpay/create-order', { amount });
  return res.data;
};

export const verifyRazorpayPayment = async (data: RazorpayVerifyRequest): Promise<string> => {
  const res = await api.post('/payments/razorpay/verify', data);
  return res.data;
};
