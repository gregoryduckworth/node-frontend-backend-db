import { API_ENDPOINTS } from "../config/auth";

export type AuthResponse = {
  accessToken: string;
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

  if (!response.ok) {
    const errorData = await response.json();
    throw { response: { data: errorData, status: response.status } };
  }

  return response.json();
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await fetch(API_ENDPOINTS.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw { response: { data: errorData, status: response.status } };
  }

  return response.json();
};

export const logout = async (): Promise<{ message: string }> => {
  const response = await fetch(API_ENDPOINTS.LOGOUT, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw { response: { data: errorData, status: response.status } };
  }

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

  if (!response.ok) {
    const errorData = await response.json();
    throw { response: { data: errorData, status: response.status } };
  }

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

  if (!response.ok) {
    const errorData = await response.json();
    throw { response: { data: errorData, status: response.status } };
  }

  return response.json();
};
