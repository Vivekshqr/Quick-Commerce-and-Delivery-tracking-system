import axios from "axios";

// Backend base URL (Express + Socket.IO). Set in frontend/.env.local.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TOKEN_KEY = "token";
export const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY));
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const client = axios.create({ baseURL: `${API_URL}/api` });

// Attach the login token to every request.
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn an axios error into a readable message.
export const errorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || (error?.request && !error?.response ? "Cannot reach the server" : fallback);

export const authApi = {
  login: (email, password) => client.post("/auth/login", { email, password }).then((r) => r.data),
  register: (payload) => client.post("/auth/register", payload).then((r) => r.data),
  me: () => client.get("/auth/me").then((r) => r.data),
};

export const productsApi = {
  list: (params = {}) => client.get("/products", { params }).then((r) => r.data),
  categories: () => client.get("/products/categories").then((r) => r.data),
  get: (id) => client.get(`/products/${id}`).then((r) => r.data),
};

export const addressesApi = {
  list: () => client.get("/addresses").then((r) => r.data),
  add: (address) => client.post("/addresses", address).then((r) => r.data),
  update: (id, changes) => client.put(`/addresses/${id}`, changes).then((r) => r.data),
  remove: (id) => client.delete(`/addresses/${id}`).then((r) => r.data),
};

export const ordersApi = {
  create: (order) => client.post("/orders", order).then((r) => r.data),
  forCustomer: (customerId) => client.get(`/orders/customer/${customerId}`).then((r) => r.data),
  active: () => client.get("/orders/pending").then((r) => r.data),
  history: (userId) => client.get(`/orders/history/${userId}`).then((r) => r.data),
  tracking: (orderId) => client.get(`/orders/${orderId}/tracking`).then((r) => r.data),
  updateStatus: (orderId, status) => client.put(`/orders/${orderId}/status`, { status }).then((r) => r.data),
};
