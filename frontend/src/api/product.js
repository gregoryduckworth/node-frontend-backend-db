import axios from "axios";

export const getProductById = async (userId, productId) => {
  return axios.get(`/api/${userId}/products/${productId}`);
};

export const getUserProducts = async (
  userId,
  search_query = "",
  page = 0,
  limit = 5
) => {
  return axios.get(
    `/api/${userId}/products?search_query=${search_query}&page=${page}&limit=${limit}`
  );
};

export const addProduct = async (userId, name, price, token) => {
  return axios.post(
    `/api/${userId}/products`,
    { name, price },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const updateProduct = async (userId, productId, name, price, token) => {
  return axios.put(
    `/api/${userId}/products/${productId}`,
    { name, price },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const deleteProduct = async (userId, productId, token) => {
  return axios.delete(`/api/${userId}/products/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
