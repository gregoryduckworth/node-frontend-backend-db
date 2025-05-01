import { create } from "zustand";
import { toast } from "sonner";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (message: string, type: NotificationType) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (message, type) => {
    const id = generateId();
    // Use sonner toast API directly
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "warning":
        toast.warning(message);
        break;
      case "info":
      default:
        toast.info(message);
        break;
    }

    // Still update the store for backward compatibility
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }],
    }));

    return id;
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (notification) => notification.id !== id
      ),
    })),

  clearNotifications: () => set({ notifications: [] }),
}));

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
