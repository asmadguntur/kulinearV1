import { useCallback, useEffect, useMemo } from "react";

import { useAdminTransactions } from "@/hooks/useTransactions";
import { buildPaymentStats } from "@/lib/paymentMethod";
import {
  selectSelectedMethod,
  usePaymentMethodStore,
} from "@/store/paymentMethodStore";

// Daftar bank + bank yang dipilih. Dipakai user maupun admin.
export function usePaymentMethods() {
  // Ambil per-field, jangan kembalikan object baru dari selector.
  const methods = usePaymentMethodStore((s) => s.methods);
  const loading = usePaymentMethodStore((s) => s.loading);
  const loaded = usePaymentMethodStore((s) => s.loaded);
  const error = usePaymentMethodStore((s) => s.error);
  const selectedId = usePaymentMethodStore((s) => s.selectedId);
  const selectedMethod = usePaymentMethodStore(selectSelectedMethod);

  // Action di Zustand referensinya stabil, aman dipakai di dependency array.
  const ensureLoaded = usePaymentMethodStore((s) => s.ensureLoaded);
  const refetch = usePaymentMethodStore((s) => s.fetchMethods);
  const select = usePaymentMethodStore((s) => s.select);
  const clearSelection = usePaymentMethodStore((s) => s.clearSelection);

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  return {
    methods,
    // Selama fetch pertama belum selesai, tetap anggap loading.
    loading: loading || !loaded,
    error,
    selectedId,
    selectedMethod,
    select,
    clearSelection,
    refetch,
  };
}

export function usePaymentMethodStats() {
  const payment = usePaymentMethods();
  const admin = useAdminTransactions();

  // Statistik adalah turunan, jadi tidak disimpan di store.
  // useMemo menghitung ulang hanya saat daftar bank atau transaksi berubah.
  const stats = useMemo(
    () => buildPaymentStats(payment.methods, admin.transactions),
    [payment.methods, admin.transactions],
  );

  const { refetch: refetchMethods } = payment;
  const { refetch: refetchTransactions } = admin;
  const refetch = useCallback(() => {
    refetchMethods();
    refetchTransactions();
  }, [refetchMethods, refetchTransactions]);

  return {
    stats,
    loading: payment.loading || admin.loading,
    // Tampilkan error yang mana saja yang muncul lebih dulu.
    error: payment.error || admin.error,
    refetch,
  };
}
