import { useCallback, useEffect } from "react";

import { useAdminTransactionStore } from "@/store/adminTransactionStore";
import { useTransactionStore } from "@/store/transactionStore";

// ---------------------------------------------------------------------------
// Transaksi milik user yang login (store).
// enabled: false dipakai CartPage: ia hanya butuh checkout(), tidak perlu
// memuat daftar transaksi saat halaman dibuka.
// ---------------------------------------------------------------------------
export function useMyTransactions({ enabled = true } = {}) {
  // Ambil per-field, jangan kembalikan object baru dari selector.
  const transactions = useTransactionStore((s) => s.transactions);
  const loading = useTransactionStore((s) => s.loading);
  const loaded = useTransactionStore((s) => s.loaded);
  const error = useTransactionStore((s) => s.error);
  const submitting = useTransactionStore((s) => s.submitting);
  const pendingIds = useTransactionStore((s) => s.pendingIds);
  const actionError = useTransactionStore((s) => s.actionError);

  const ensureLoaded = useTransactionStore((s) => s.ensureLoaded);
  const refetch = useTransactionStore((s) => s.fetchTransactions);
  const checkout = useTransactionStore((s) => s.checkout);
  const cancel = useTransactionStore((s) => s.cancel);
  const uploadProof = useTransactionStore((s) => s.uploadProof);
  const saveProofUrl = useTransactionStore((s) => s.saveProofUrl);
  const clearActionError = useTransactionStore((s) => s.clearActionError);

  useEffect(() => {
    // actionError global, jadi bersihkan sisa error dari halaman sebelumnya.
    clearActionError();
    if (enabled) ensureLoaded();
  }, [enabled, ensureLoaded, clearActionError]);

  const isPending = useCallback(
    (transactionId) => pendingIds.includes(transactionId),
    [pendingIds],
  );

  return {
    transactions,
    // Selama fetch pertama belum selesai, tetap anggap loading supaya halaman
    // tidak sempat menampilkan "belum ada pesanan".
    loading: enabled && (loading || !loaded),
    error,
    submitting,
    actionError,
    isPending,
    refetch,
    checkout,
    cancel,
    uploadProof,
    saveProofUrl,
  };
}

// ---------------------------------------------------------------------------
// Daftar bank untuk CartPage (bagian payment… di transactionStore).
// ---------------------------------------------------------------------------
export function usePaymentMethods() {
  const methods = useTransactionStore((s) => s.paymentMethods);
  const loading = useTransactionStore((s) => s.paymentLoading);
  const loaded = useTransactionStore((s) => s.paymentLoaded);
  const error = useTransactionStore((s) => s.paymentError);
  const ensurePaymentMethods = useTransactionStore(
    (s) => s.ensurePaymentMethods,
  );

  useEffect(() => {
    ensurePaymentMethods();
  }, [ensurePaymentMethods]);

  return { methods, loading: loading || !loaded, error };
}

// ---------------------------------------------------------------------------
// Semua transaksi untuk admin (adminTransactionStore).
// ---------------------------------------------------------------------------
export function useAdminTransactions() {
  const transactions = useAdminTransactionStore((s) => s.transactions);
  const usersById = useAdminTransactionStore((s) => s.usersById);
  const loading = useAdminTransactionStore((s) => s.loading);
  const loaded = useAdminTransactionStore((s) => s.loaded);
  const error = useAdminTransactionStore((s) => s.error);
  const pendingIds = useAdminTransactionStore((s) => s.pendingIds);
  const actionError = useAdminTransactionStore((s) => s.actionError);

  const ensureLoaded = useAdminTransactionStore((s) => s.ensureLoaded);
  const refetch = useAdminTransactionStore((s) => s.fetchAll);
  const changeStatus = useAdminTransactionStore((s) => s.changeStatus);
  const clearActionError = useAdminTransactionStore((s) => s.clearActionError);

  useEffect(() => {
    clearActionError();
    ensureLoaded();
  }, [ensureLoaded, clearActionError]);

  const isPending = useCallback(
    (transactionId) => pendingIds.includes(transactionId),
    [pendingIds],
  );

  return {
    transactions,
    usersById,
    loading: loading || !loaded,
    error,
    actionError,
    isPending,
    changeStatus,
    refetch,
  };
}
