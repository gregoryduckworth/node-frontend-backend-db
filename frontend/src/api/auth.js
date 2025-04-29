import axios from "axios";

export const register = async (name, email, password, confirmPassword) => {
  return axios.post("/api/auth/register", {
    name,
    email,
    password,
    confirmPassword,
  });
};

export const login = async (email, password) => {
  return axios.post(
    "/api/auth/login",
    { email, password },
    { withCredentials: true }
  );
};

export const logout = async () => {
  return axios.delete("/api/auth/logout");
};

export const refreshToken = async () => {
  const response = await axios.get("/api/token");
  return response.data;
};
