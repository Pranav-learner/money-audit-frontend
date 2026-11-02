import api from '@/lib/api';

/**
 * Collaborative expense edit-request workflow. Endpoints verified against the backend
 * EditRequestController (`/api/edit-requests`, `/expenses/{id}/edit-request`).
 * Response fields are typed defensively since the backend serializes the entity.
 */
export interface EditRequest {
  id: string;
  expenseId?: string;
  expenseTitle?: string;
  requestedByName?: string;
  requestedToName?: string;
  newAmount?: number;
  note?: string;
  status?: string;
  createdAt?: string;
  resolvedAt?: string;
}

export const getPendingEditRequests = async (): Promise<EditRequest[]> => {
  const res = await api.get('/edit-requests/pending');
  return res.data;
};

export const createEditRequest = async (
  expenseId: string,
  data: { newAmount: number; note?: string },
): Promise<void> => {
  await api.post(`/expenses/${expenseId}/edit-request`, data);
};

export const approveEditRequest = async (id: string): Promise<void> => {
  await api.put(`/edit-requests/${id}/approve`);
};

export const rejectEditRequest = async (id: string): Promise<void> => {
  await api.put(`/edit-requests/${id}/reject`);
};
