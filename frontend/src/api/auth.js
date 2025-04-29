export const register = async (name, email, password, confirmPassword) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });
  return response.json();
};

export const login = async (email, password) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

export const logout = async () => {
  const response = await fetch("/api/auth/logout", {
    method: "DELETE",
    credentials: "include",
  });
  return response.json();
};

export const refreshToken = async () => {
  const response = await fetch("/api/token", {
    credentials: "include",
  });
  return response.json();
};
