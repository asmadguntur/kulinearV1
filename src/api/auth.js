import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export async function registerUser(payload) {
  const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, payload);
  return response.data;
}

export async function logoutUser() {
  const response = await apiClient.get(ENDPOINTS.AUTH.LOGOUT);
  return response.data;
}
