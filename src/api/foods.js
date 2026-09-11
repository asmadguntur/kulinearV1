import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export async function getFoods() {
  const response = await apiClient.get(ENDPOINTS.FOODS.GET_ALL);
  return response.data;
}

export async function getFoodById(foodId) {
  const response = await apiClient.get(ENDPOINTS.FOODS.GET_BY_ID(foodId));
  return response.data;
}
