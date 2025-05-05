import { create } from 'zustand';
import { toast } from 'sonner';
import { NotificationType } from '@/types/notification';

export type { NotificationType };

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  testId?: string; // Added for testing purposes
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

    switch (type) {
      case NotificationType.SUCCESS:
        toast.success(message, {
          id,
        });
        break;
      case NotificationType.ERROR:
        toast.error(message, {
          id,
        });
        break;
      case NotificationType.WARNING:
        toast.warning(message, {
          id,
        });
        break;
      case NotificationType.INFO:
      default:
        toast.info(message, {
          id,
        });
        break;
    }

    set((state) => ({
      notifications: [...state.notifications, { id, message, type }],
    }));

    return id;
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),
}));

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
