import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

// Semua endpoint membungkus hasilnya: { code, status, message, data }.
// Yang dipakai komponen hanya isi "data", jadi dibuka di sini.
export async function getFoods() {
  const response = await apiClient.get(ENDPOINTS.FOODS.GET_ALL);
  return response.data.data;
}

export async function getFoodById(foodId) {
  const response = await apiClient.get(ENDPOINTS.FOODS.GET_BY_ID(foodId));
  return response.data.data;
}
