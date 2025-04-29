export const getProducts = async () => {
  const response = await fetch("/api/products");
  return response.json();
};

export const getProductById = async (id) => {
  const response = await fetch(`/api/products/${id}`);
  return response.json();
};

export const createProduct = async (product) => {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return response.json();
};

export const updateProduct = async (id, product) => {
  const response = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return response.json();
};

export const deleteProduct = async (id) => {
  const response = await fetch(`/api/products/${id}`, {
    method: "DELETE",
  });
  return response.json();
};
