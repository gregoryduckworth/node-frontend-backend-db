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
  const response = await fetch("/api/token", {
    credentials: "include",
  });
  return response.json();
};
