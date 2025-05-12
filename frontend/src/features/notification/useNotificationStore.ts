import { create } from 'zustand';
import { toast } from 'sonner';
import { NotificationType, NotificationState } from './types';

export type { NotificationType };

function pickNotificationState(state: Partial<NotificationState>): Partial<NotificationState> {
  return {
    notifications: state.notifications,
  };
}

const NOTIFICATION_STORAGE_KEY = 'notificationState';

function loadPersistedNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function persistNotificationState(state: Partial<NotificationState>) {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(pickNotificationState(state)));
  } catch {
    // Optionally log or handle error
  }
}

export const useNotificationStore = create<NotificationState>((set) => {
  const persisted = loadPersistedNotifications() || { notifications: [] };
  return {
    ...persisted,
    addNotification: (message, type) => {
      set((state) => {
        const exists = state.notifications.some((n) => n.message === message && n.type === type);
        if (exists) return state;
        const id = generateId();
        switch (type) {
          case NotificationType.SUCCESS:
            toast.success(message, { id });
            break;
          case NotificationType.ERROR:
            toast.error(message, { id });
            break;
          case NotificationType.WARNING:
            toast.warning(message, { id });
            break;
          case NotificationType.INFO:
          default:
            toast.info(message, { id });
            break;
        }
        const newState = {
          notifications: [...state.notifications, { id, message, type }],
        };
        persistNotificationState(newState);
        return newState;
      });
    },
    removeNotification: (id) =>
      set((state) => {
        const newState = {
          notifications: state.notifications.filter((notification) => notification.id !== id),
        };
        persistNotificationState(newState);
        return newState;
      }),
    clearNotifications: () => {
      set({ notifications: [] });
      persistNotificationState({ notifications: [] });
    },
  };
});

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
