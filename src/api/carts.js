import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

// Semua endpoint keranjang butuh token login. Isi keranjang disimpan per akun,
// jadi yang dikembalikan hanya milik user yang sedang login.
export async function getCarts() {
  const response = await apiClient.get(ENDPOINTS.CARTS.GET);
  return response.data.data;
}

// API membuat baris baru kalau makanan belum ada di keranjang, dan
// mengembalikan data cart (id cart, foodId, quantity) hasil simpanan.
export async function addCart(foodId, quantity = 1) {
  const response = await apiClient.post(ENDPOINTS.CARTS.ADD, {
    foodId,
    quantity,
  });
  return response.data.data;
}

export async function updateCart(cartId, quantity) {
  const response = await apiClient.post(ENDPOINTS.CARTS.UPDATE(cartId), {
    quantity,
  });
  return response.data.data;
}

export async function deleteCart(cartId) {
  const response = await apiClient.delete(ENDPOINTS.CARTS.DELETE(cartId));
  return response.data;
}
