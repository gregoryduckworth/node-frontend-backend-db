import { API_ENDPOINTS } from "../config/auth";

export type AuthResponse = {
  accessToken: string;
};

export type ErrorResponse = {
  message: string;
  code?: string;
  statusCode?: number;
};

export const register = async (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): Promise<AuthResponse> => {
  const response = await fetch(API_ENDPOINTS.REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });
  return response.json();
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      let errorData: ErrorResponse = { message: 'Unknown error' };
      
      try {
        // Try to parse the error response
        errorData = await response.json();
      } catch (e) {
        // If parsing fails, use status text
        errorData.message = response.statusText;
      }
      
      // Enhance error with status code for better error handling
      errorData.statusCode = response.status;
      
      // Check if it's a user not found error (404) or invalid credentials (401)
      if (response.status === 404) {
        errorData.code = 'EMAIL_NOT_REGISTERED';
      } else if (response.status === 401) {
        errorData.code = 'INVALID_CREDENTIALS';
      }
      
      throw errorData;
    }
    
    return await response.json();
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error;
    }
    throw { message: 'Network error', code: 'NETWORK_ERROR' };
  }
};

export const logout = async (): Promise<{ message: string }> => {
  const response = await fetch(API_ENDPOINTS.LOGOUT, {
    method: "DELETE",
    credentials: "include",
  });
  return response.json();
};

export const refreshToken = async (): Promise<
  AuthResponse | { accessToken?: string }
> => {
  try {
    const response = await fetch(API_ENDPOINTS.REFRESH_TOKEN, {
      credentials: "include",
    });
    if (response.status === 204) {
      return { accessToken: undefined };
    }
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.warn("Refresh token response is not JSON:", contentType);
      return { accessToken: undefined };
    }
    const text = await response.text();
    if (!text) {
      console.warn("Refresh token response is empty");
      return { accessToken: undefined };
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse refresh token response:", e);
      return { accessToken: undefined };
    }
  } catch (error) {
    console.error("Network error during token refresh:", error);
    return { accessToken: undefined };
  }
};

export const requestPasswordReset = async (
  email: string
): Promise<{ message: string }> => {
  const response = await fetch(API_ENDPOINTS.FORGOT_PASSWORD, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return response.json();
};

export const resetPassword = async (
  token: string,
  password: string,
  confirmPassword: string
): Promise<{ message: string }> => {
  const response = await fetch(API_ENDPOINTS.RESET_PASSWORD, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password, confirmPassword }),
  });
  return response.json();
};
