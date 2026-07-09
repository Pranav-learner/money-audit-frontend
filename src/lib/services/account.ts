import api from '@/lib/api';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Attempts a password change against the backend. The backend does not yet
 * expose this endpoint, so callers should handle failure gracefully — the UI
 * is ready for when it lands.
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
  await api.post('/auth/change-password', data);
};
