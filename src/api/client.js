import axios from "axios";

import { authStorage } from "@/lib/authStorage";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  const apiKey = import.meta.env.VITE_API_KEY;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (apiKey) config.headers.apiKey = apiKey;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) authStorage.clear();
    return Promise.reject(error);
  },
);

export default apiClient;
