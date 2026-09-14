import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

// Semua endpoint favorit butuh token login. Makanan disimpan per akun,
// jadi daftar yang dikembalikan hanya milik user yang sedang login.
export async function getLikedFoods() {
  const response = await apiClient.get(ENDPOINTS.FAVORITES.GET_LIKED);
  return response.data.data;
}

export async function likeFood(foodId) {
  const response = await apiClient.post(ENDPOINTS.FAVORITES.LIKE, { foodId });
  return response.data;
}

export async function unlikeFood(foodId) {
  const response = await apiClient.post(ENDPOINTS.FAVORITES.UNLIKE, {
    foodId,
  });
  return response.data;
}
