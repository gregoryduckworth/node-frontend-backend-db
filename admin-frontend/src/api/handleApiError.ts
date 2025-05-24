import type { ApiErrorResponse } from './types';
import { useNotificationStore } from '@/features/notification/useNotificationStore';
import { NotificationType } from '@/features/notification/types';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: ApiErrorResponse } };
  const message = err?.response?.data?.message;
  if (message === 'No token provided') return '';
  return message || fallback;
}

export function handleApiError(
  error: unknown,
  fallbackMessage: string = 'An unexpected error occurred',
) {
  const { addNotification } = useNotificationStore.getState();
  const errorMessage = getApiErrorMessage(error, fallbackMessage);
  if (errorMessage) {
    addNotification(errorMessage, NotificationType.ERROR);
  }
  return errorMessage;
}
