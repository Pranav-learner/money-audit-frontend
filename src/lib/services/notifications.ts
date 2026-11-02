import api from "@/lib/api";

export interface BackendNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export const getNotifications = async (unreadOnly: boolean = false): Promise<BackendNotification[]> => {
  const response = await api.get("/notifications", {
    params: { unreadOnly },
  });
  return response.data;
};

export const getUnreadNotificationCount = async (): Promise<{ unreadCount: number }> => {
  const response = await api.get("/notifications/unread-count");
  return response.data;
};

export const markNotificationRead = async (id: string): Promise<BackendNotification> => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsRead = async (): Promise<{ success: boolean; updatedCount: number }> => {
  const response = await api.put("/notifications/read-all");
  return response.data;
};
