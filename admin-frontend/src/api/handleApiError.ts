import type { ApiErrorResponse } from './types';
import { useNotificationStore } from '@/features/notification/useNotificationStore';
import { NotificationType } from '@/features/notification/types';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: ApiErrorResponse } };
  return err?.response?.data?.message || fallback;
}

export function handleApiError(
  error: unknown,
  fallbackMessage: string = 'An unexpected error occurred',
) {
  const { addNotification } = useNotificationStore.getState();
  const errorMessage = getApiErrorMessage(error, fallbackMessage);
  addNotification(errorMessage, NotificationType.ERROR);
  return errorMessage;
}
