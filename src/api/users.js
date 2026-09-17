import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export async function getAllUsers() {
  const response = await apiClient.get(ENDPOINTS.USERS.GET_ALL);
  return response.data.data;
}

export async function updateUserRole(userId, role) {
  const response = await apiClient.post(ENDPOINTS.USERS.UPDATE_ROLE(userId), {
    role,
  });
  return response.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get(ENDPOINTS.USERS.CURRENT_USER);
  // return response.data.data;
  return response.data.data ?? response.data.user ?? response.data;
}

export async function updateProfile(payload) {
  const response = await apiClient.post(
    ENDPOINTS.USERS.UPDATE_PROFILE,
    payload,
  );
  return response.data.data;
}
