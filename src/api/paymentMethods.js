import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export async function getPaymentMethods() {
  const response = await apiClient.get(ENDPOINTS.PAYMENTS.GET_METHODS);
  return response.data.data;
}
