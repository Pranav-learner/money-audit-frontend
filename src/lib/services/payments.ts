import api from '@/lib/api';

export interface RazorpayVerifyRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  amount: number;
  toUserId: string;
  groupId?: string;
  note?: string;
}

export const getRazorpayKey = async (): Promise<string> => {
  const res = await api.get('/payments/razorpay/key');
  return res.data.keyId;
};

export const createRazorpayOrder = async (amount: number): Promise<string> => {
  const res = await api.post('/payments/razorpay/create-order', { amount });
  return res.data.orderId;
};

export const verifyRazorpayPayment = async (data: RazorpayVerifyRequest): Promise<void> => {
  await api.post('/payments/razorpay/verify', data);
};
