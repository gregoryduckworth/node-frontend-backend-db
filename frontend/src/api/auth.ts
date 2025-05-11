import { API_ENDPOINTS } from '@/config/auth';
import { apiClient } from './apiClient';

export type AuthResponse = {
  accessToken: string;
};

export const register = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string
): Promise<AuthResponse> => {
  return apiClient<AuthResponse>(API_ENDPOINTS.REGISTER, {
    method: 'POST',
    body: { firstName, lastName, email, password, confirmPassword },
  });
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  return apiClient<AuthResponse>(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: { email, password },
    includeCredentials: true,
  });
};

export const logout = async (): Promise<{ message: string }> => {
  return apiClient<{ message: string }>(API_ENDPOINTS.LOGOUT, {
    method: 'DELETE',
    includeCredentials: true,
  });
};

export const refreshToken = async (): Promise<AuthResponse | { accessToken?: string }> => {
  try {
    return await apiClient<AuthResponse>(API_ENDPOINTS.REFRESH_TOKEN, {
      includeCredentials: true,
    });
  } catch (error: any) {
    const status = error?.response?.status;
    if (status !== 204 && status !== 403) {
      console.error('Network error during token refresh:', error);
    }
    return { accessToken: undefined };
  }
};

export const updateProfile = async (
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  dateOfBirth: string | null,
  token: string
): Promise<{ message: string }> => {
  return apiClient<{ message: string }>(`${API_ENDPOINTS.UPDATE_PROFILE}/${id}`, {
    method: 'PUT',
    body: { firstName, lastName, email, dateOfBirth },
    headers: {
      Authorization: `Bearer ${token}`,
    },
    includeCredentials: true,
  });
};

export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  return apiClient<{ message: string }>(API_ENDPOINTS.FORGOT_PASSWORD, {
    method: 'POST',
    body: { email },
  });
};

export const resetPassword = async (
  token: string,
  password: string,
  confirmPassword: string
): Promise<{ message: string }> => {
  return apiClient<{ message: string }>(API_ENDPOINTS.RESET_PASSWORD, {
    method: 'POST',
    body: { token, password, confirmPassword },
  });
};
