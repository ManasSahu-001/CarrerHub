import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const instance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Attach access token to every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — unwrap data envelope
instance.interceptors.response.use(
  (res) => res.data.data,
  (err) => {
    const msg = err.response?.data?.message || "Request failed";
    return Promise.reject(new Error(msg));
  }
);

const api = {
  get: (path) => instance.get(path),
  post: (path, body) => instance.post(path, body),
  put: (path, body) => instance.put(path, body),
  delete: (path) => instance.delete(path),
  postForm: (path, formData) =>
    instance.post(path, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default api;
