import { useNotificationStore } from '@/features/notification/useNotificationStore';
import { NotificationType } from '@/features/notification/types';

/**
 * Handles API errors and shows a notification to the user.
 * Returns a user-friendly error message.
 */
export function handleApiError(
  error: any,
  fallbackMessage: string = 'An unexpected error occurred'
) {
  const { addNotification } = useNotificationStore.getState();
  const errorMessage = error?.response?.data?.message || error?.message || fallbackMessage;
  addNotification(errorMessage, NotificationType.ERROR);
  return errorMessage;
}
