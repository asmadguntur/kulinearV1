import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

// Daftar ulasan satu makanan. Endpoint ini bisa diakses tanpa token,
// tapi halaman kita tetap berada di balik login.
export async function getFoodRatings(foodId) {
  const response = await apiClient.get(ENDPOINTS.RATINGS.GET_BY_FOOD(foodId));
  return response.data.data;
}

// Mengirim rating (1-5) dan ulasan. Wajib login: tanpa token balasannya 401.
export async function rateFood(foodId, { rating, review }) {
  const response = await apiClient.post(ENDPOINTS.RATINGS.CREATE(foodId), {
    rating,
    review,
  });
  return response.data.data;
}
