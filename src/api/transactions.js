import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

// Daftar bank: [{ id, name, imageUrl }]. Bisa diakses tanpa token.
export async function getPaymentMethods() {
  const response = await apiClient.get(ENDPOINTS.PAYMENTS.GET_METHODS);
  return response.data.data;
}

// Balasan sukses hanya { message: "Transaction Created" }, TANPA id transaksi.
// Item keranjang yang ikut di-checkout otomatis dihapus server.
export async function createTransaction({ cartIds, paymentMethodId }) {
  const response = await apiClient.post(ENDPOINTS.TRANSACTIONS.CREATE, {
    cartIds,
    paymentMethodId,
  });
  return response.data;
}

// Transaksi milik user yang login, urut dari yang PALING LAMA.
export async function getMyTransactions() {
  const response = await apiClient.get(ENDPOINTS.TRANSACTIONS.MY_TRANSACTIONS);
  return response.data.data;
}

// Khusus admin. Kalau dipanggil user, balasannya 401 dan interceptor
// di client.js akan menghapus sesi login.
export async function getAllTransactions() {
  const response = await apiClient.get(ENDPOINTS.TRANSACTIONS.ALL);
  return response.data.data;
}

// Mengembalikan null (bukan 404) kalau id tidak ditemukan.
// Tidak dipakai halaman di panduan ini, disediakan untuk latihan.
export async function getTransactionById(transactionId) {
  const response = await apiClient.get(
    ENDPOINTS.TRANSACTIONS.GET_BY_ID(transactionId),
  );
  return response.data.data;
}

// Hanya berhasil untuk status "pending".
export async function cancelTransaction(transactionId) {
  const response = await apiClient.post(
    ENDPOINTS.TRANSACTIONS.CANCEL(transactionId),
  );
  return response.data;
}

export async function updateProofPayment(transactionId, proofPaymentUrl) {
  const response = await apiClient.post(
    ENDPOINTS.TRANSACTIONS.UPDATE_PROOF(transactionId),
    { proofPaymentUrl },
  );
  return response.data;
}

// Khusus admin. status hanya boleh "success" atau "failed",
// dan hanya untuk transaksi yang masih "pending".
export async function updateTransactionStatus(transactionId, status) {
  const response = await apiClient.post(
    ENDPOINTS.TRANSACTIONS.UPDATE_STATUS(transactionId),
    { status },
  );
  return response.data;
}
