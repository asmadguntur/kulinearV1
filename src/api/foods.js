import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export async function getFoods() {
  const response = await apiClient.get(ENDPOINTS.FOODS.GET_ALL);
  return response.data.data;
}

export async function getFoodById(foodId) {
  const response = await apiClient.get(ENDPOINTS.FOODS.GET_BY_ID(foodId));
  return response.data.data;
}

export async function createFood(payload) {
  const response = await apiClient.post(ENDPOINTS.FOODS.CREATE, payload);
  return response.data.data;
}

export async function updateFood(foodId, payload) {
  const response = await apiClient.post(
    ENDPOINTS.FOODS.UPDATE_BY_ID(foodId),
    payload,
  );
  return response.data.data;
}

export async function deleteFood(foodId) {
  const response = await apiClient.delete(ENDPOINTS.FOODS.DELETE_BY_ID(foodId));
  return response.data;
}
