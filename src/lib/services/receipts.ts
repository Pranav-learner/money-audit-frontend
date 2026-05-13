import api from '@/lib/api';

export interface ReceiptUploadResponse {
  id: string;
  amount: number;
  date: string;
  merchant: string;
  suggestedCategory?: string;
  status: string;
  imageUrl: string;
}

export interface ConfirmReceiptRequest {
  amount: number;
  date: string;
  merchant: string;
  categoryId?: string;
}

export interface ConfirmGroupReceiptRequest extends ConfirmReceiptRequest {
  groupId: string;
}

export const uploadReceipt = async (file: File, groupId?: string): Promise<ReceiptUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (groupId) {
    formData.append('groupId', groupId);
  }
  const res = await api.post('/receipts/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const confirmReceipt = async (id: string, data: ConfirmReceiptRequest): Promise<ReceiptUploadResponse> => {
  const res = await api.post(`/receipts/${id}/confirm`, data);
  return res.data;
};

export const confirmGroupReceipt = async (id: string, data: ConfirmGroupReceiptRequest): Promise<ReceiptUploadResponse> => {
  const res = await api.post(`/receipts/${id}/confirm-group`, data);
  return res.data;
};

export const getReceipts = async (): Promise<ReceiptUploadResponse[]> => {
  const res = await api.get('/receipts');
  return res.data;
};

export const getReceiptById = async (id: string): Promise<ReceiptUploadResponse> => {
  const res = await api.get(`/receipts/${id}`);
  return res.data;
};

export const getGroupReceipts = async (groupId: string): Promise<ReceiptUploadResponse[]> => {
  const res = await api.get(`/receipts/group/${groupId}`);
  return res.data;
};
