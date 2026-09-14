import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

// Endpoint user yang tersedia untuk admin hanya dua: daftar semua user dan
// ubah role. API tidak punya endpoint hapus user atau edit data user lain.
// Menambah user memakai registerUser dari api/auth.js.
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
