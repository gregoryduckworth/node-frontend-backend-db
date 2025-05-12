import { useNotificationStore } from '@/features/notification/useNotificationStore';
import { NotificationType } from '@/features/notification/types';

/**
 * Handles API errors and shows a notification to the user.
 * Returns a user-friendly error message.
 */
export function handleApiError(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred',
): string {
  const { addNotification } = useNotificationStore.getState();
  const errorMessage = extractErrorMessage(error) || fallbackMessage;
  addNotification(errorMessage, NotificationType.ERROR);
  return errorMessage;
}

function extractErrorMessage(error: unknown): string | undefined {
  if (isErrorWithResponse(error)) {
    const message = error.response.data?.message;
    if (typeof message === 'string') {
      return message;
    }
  }

  if (isErrorWithMessage(error)) {
    return error.message;
  }

  return undefined;
}

function isErrorWithResponse(
  error: unknown,
): error is { response: { data?: { message?: unknown } } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as Record<string, unknown>).response === 'object'
  );
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}
