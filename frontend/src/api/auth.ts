export type AuthResponse = {
  accessToken: string;
};

export const register = async (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): Promise<AuthResponse> => {
  const response = await fetch("/api/auth/register", {
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
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

export const logout = async (): Promise<{ message: string }> => {
  const response = await fetch("/api/auth/logout", {
    method: "DELETE",
    credentials: "include",
  });
  return response.json();
};

export const refreshToken = async (): Promise<
  AuthResponse | { accessToken?: string }
> => {
  try {
    const response = await fetch("/api/token", {
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
  const response = await fetch("/api/auth/forgot-password", {
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
  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password, confirmPassword }),
  });
  return response.json();
};
