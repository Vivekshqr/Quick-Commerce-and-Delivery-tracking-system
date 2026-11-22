import axios from "axios";

// Backend base URL (Express + Socket.IO). Set in frontend/.env.local.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// The login token (JWT) lives in an httpOnly cookie set by the backend, so JavaScript never sees it.
// We only keep a harmless "logged in" hint in localStorage so pages know whether to try loading the user.
const SESSION_KEY = "qc_session";
const LEGACY_TOKEN_KEY = "token"; // tokens were stored here before; removed on login/logout
export const hasSession = () => (typeof window === "undefined" ? false : localStorage.getItem(SESSION_KEY) === "1");
export const markSession = () => {
  localStorage.setItem(SESSION_KEY, "1");
  localStorage.removeItem(LEGACY_TOKEN_KEY);
};
export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
};

// withCredentials: send the auth cookie to the API (CORS with credentials).
const client = axios.create({ baseURL: `${API_URL}/api`, withCredentials: true });

// If the cookie expired, forget the "logged in" hint.
client.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") clearSession();
    return Promise.reject(error);
  }
);

// Turn an axios error into a readable message.
export const errorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || (error?.request && !error?.response ? "Cannot reach the server" : fallback);

export const authApi = {
  login: (email, password) => client.post("/auth/login", { email, password }).then((r) => r.data),
  register: (payload) => client.post("/auth/register", payload).then((r) => r.data),
  me: () => client.get("/auth/me").then((r) => r.data),
  logout: () => client.post("/auth/logout").then((r) => r.data),
  forgotPassword: (email) => client.post("/auth/forgot-password", { email }).then((r) => r.data),
  resetPassword: (token, password) => client.post("/auth/reset-password", { token, password }).then((r) => r.data),
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

export const adminApi = {
  stats: () => client.get("/admin/stats").then((r) => r.data),
  orders: (status) => client.get("/admin/orders", { params: { status } }).then((r) => r.data),
  partners: () => client.get("/admin/partners").then((r) => r.data),
  assign: (orderId, partnerId) => client.put(`/admin/orders/${orderId}/assign`, { partnerId }).then((r) => r.data),
  createProduct: (p) => client.post("/admin/products", p).then((r) => r.data),
  updateProduct: (id, p) => client.put(`/admin/products/${id}`, p).then((r) => r.data),
  deleteProduct: (id) => client.delete(`/admin/products/${id}`).then((r) => r.data),
};

export const ordersApi = {
  create: (order) => client.post("/orders", order).then((r) => r.data),
  forCustomer: (customerId) => client.get(`/orders/customer/${customerId}`).then((r) => r.data),
  active: () => client.get("/orders/pending").then((r) => r.data),
  history: (userId) => client.get(`/orders/history/${userId}`).then((r) => r.data),
  tracking: (orderId) => client.get(`/orders/${orderId}/tracking`).then((r) => r.data),
  updateStatus: (orderId, status, otp) => client.put(`/orders/${orderId}/status`, { status, otp }).then((r) => r.data),
  cancel: (orderId) => client.put(`/orders/${orderId}/cancel`).then((r) => r.data),
  rate: (orderId, stars, review) => client.post(`/orders/${orderId}/rating`, { stars, review }).then((r) => r.data),
  partnerRating: (partnerId) => client.get(`/orders/partners/${partnerId}/rating`).then((r) => r.data),
};
