import { API_ENDPOINTS } from '@/config/auth';
import { apiClient } from '@/api/apiClient';
import { useAuthStore } from './useAuthStore';
import type { AuthResponse, ApiMessageResponse, RefreshTokenResponse } from './types';
import type { ApiErrorResponse } from '@/api/types';

export const login = async (
  email: string,
  password: string,
  rememberMe?: boolean,
): Promise<AuthResponse> => {
  return apiClient<AuthResponse>(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: { email, password, rememberMe },
    includeCredentials: true,
  });
};

export const logout = async (): Promise<ApiMessageResponse> => {
  return apiClient<ApiMessageResponse>(API_ENDPOINTS.LOGOUT, {
    method: 'DELETE',
    includeCredentials: true,
  });
};

export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  try {
    return await apiClient<AuthResponse>(API_ENDPOINTS.REFRESH_TOKEN, {
      includeCredentials: true,
    });
  } catch (error: unknown) {
    const err = error as { response?: ApiErrorResponse };
    const status = err?.response?.status;
    if (status !== 204 && status !== 401 && status !== 403) {
      console.error('Network error during token refresh:', err);
    }
    return { accessToken: undefined };
  }
};

export const updateProfile = async (
  firstName: string,
  lastName: string,
  email: string,
  dateOfBirth: string | null,
): Promise<ApiMessageResponse> => {
  const { id, token } = useAuthStore.getState();
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('User ID is required for profile update');
  }
  if (!token) {
    throw new Error('Auth token is required for profile update');
  }
  return apiClient<ApiMessageResponse>(`${API_ENDPOINTS.UPDATE_PROFILE}/${id}`, {
    method: 'PUT',
    body: { firstName, lastName, email, dateOfBirth },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const requestPasswordReset = async (email: string): Promise<ApiMessageResponse> => {
  return apiClient<ApiMessageResponse>(API_ENDPOINTS.FORGOT_PASSWORD, {
    method: 'POST',
    body: { email },
  });
};

export const resetPassword = async (
  token: string,
  password: string,
  confirmPassword: string,
): Promise<ApiMessageResponse> => {
  return apiClient<ApiMessageResponse>(API_ENDPOINTS.RESET_PASSWORD, {
    method: 'POST',
    body: { token, password, confirmPassword },
  });
};
