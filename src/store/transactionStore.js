import { create } from "zustand";

import { getErrorMessage } from "@/api/client";
import {
  cancelTransaction,
  createTransaction,
  getMyTransactions,
  getPaymentMethods,
  updateProofPayment,
} from "@/api/transactions";
import { uploadImage } from "@/api/upload";
import { sortNewest } from "@/lib/transaction";

const initialState = {
  // --- transaksi milik user ---
  transactions: [], // terbaru di atas
  loading: false,
  error: null,
  loaded: false,
  submitting: false, // checkout sedang berjalan
  pendingIds: [], // id transaksi yang sedang dibatalkan / dikirimi bukti
  actionError: "",

  // --- daftar bank (GET /payment-methods) ---
  paymentMethods: [],
  paymentLoading: false,
  paymentError: null,
  paymentLoaded: false,
};

export const useTransactionStore = create((set, get) => {
  const startPending = (id) =>
    set((s) => ({ actionError: "", pendingIds: [...s.pendingIds, id] }));

  const stopPending = (id) =>
    set((s) => ({ pendingIds: s.pendingIds.filter((item) => item !== id) }));

  // Pola yang sama untuk semua aksi per transaksi: tandai sedang diproses,
  // jalankan tugasnya, ambil ulang daftar, lalu lepas tandanya.
  const runForTransaction = async (id, task) => {
    startPending(id);
    try {
      await task();
      await get().fetchTransactions();
      return true;
    } catch (error) {
      set({ actionError: getErrorMessage(error) });
      return false;
    } finally {
      stopPending(id);
    }
  };

  return {
    ...initialState,

    fetchTransactions: async () => {
      set({ loading: true, error: null });
      try {
        const data = await getMyTransactions();
        set({
          transactions: sortNewest(Array.isArray(data) ? data : []),
          loading: false,
          loaded: true,
        });
      } catch (error) {
        set({ loading: false, error, loaded: true });
      }
    },

    ensureLoaded: () => {
      const { loaded, loading, fetchTransactions } = get();
      if (loaded || loading) return;
      fetchTransactions();
    },

    // Mengembalikan { ok, transactionId }.
    // transactionId bisa null kalau transaksi dibuat tapi daftar gagal diambil.
    checkout: async ({ cartIds, paymentMethodId }) => {
      set({ actionError: "" });

      if (!cartIds.length) {
        set({ actionError: "Keranjang masih kosong." });
        return { ok: false, transactionId: null };
      }
      if (!paymentMethodId) {
        set({ actionError: "Pilih metode pembayaran dulu." });
        return { ok: false, transactionId: null };
      }

      // Catat id yang sudah ada SEBELUM membuat transaksi baru.
      const oldIds = new Set(get().transactions.map((item) => item.id));

      set({ submitting: true });
      try {
        await createTransaction({ cartIds, paymentMethodId });
        // create-transaction tidak mengembalikan id. Ambil ulang daftar,
        // lalu cari transaksi yang belum ada di oldIds. Karena daftar sudah
        // diurutkan terbaru di atas, find() menemukan yang paling baru.
        await get().fetchTransactions();
        const created = get().transactions.find((item) => !oldIds.has(item.id));
        return { ok: true, transactionId: created?.id ?? null };
      } catch (error) {
        set({ actionError: getErrorMessage(error) });
        return { ok: false, transactionId: null };
      } finally {
        set({ submitting: false });
      }
    },

    cancel: (id) => runForTransaction(id, () => cancelTransaction(id)),

    uploadProof: (id, file) =>
      runForTransaction(id, async () => {
        const url = await uploadImage(file);
        await updateProofPayment(id, url);
      }),

    saveProofUrl: (id, url) => {
      const cleanUrl = url.trim();
      if (!/^https?:\/\//.test(cleanUrl)) {
        set({ actionError: "Link harus diawali http:// atau https://" });
        return Promise.resolve(false);
      }
      return runForTransaction(id, () => updateProofPayment(id, cleanUrl));
    },

    fetchPaymentMethods: async () => {
      set({ paymentLoading: true, paymentError: null });
      try {
        const data = await getPaymentMethods();
        set({
          paymentMethods: Array.isArray(data) ? data : [],
          paymentLoading: false,
          paymentLoaded: true,
        });
      } catch (error) {
        set({
          paymentLoading: false,
          paymentError: error,
          paymentLoaded: true,
        });
      }
    },

    ensurePaymentMethods: () => {
      const { paymentLoaded, paymentLoading, fetchPaymentMethods } = get();
      if (paymentLoaded || paymentLoading) return;
      fetchPaymentMethods();
    },

    clearActionError: () => set({ actionError: "" }),

    reset: () => set({ ...initialState }),
  };
});
