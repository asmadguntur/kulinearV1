import { create } from "zustand";

import { getErrorMessage } from "@/api/client";
import {
  getAllTransactions,
  updateTransactionStatus,
} from "@/api/transactions";
import { getAllUsers } from "@/api/users";
import { sortNewest } from "@/lib/transaction";

const initialState = {
  transactions: [], // semua transaksi dari semua user, terbaru di atas
  usersById: {}, // { [userId]: { id, name, email, ... } }
  loading: false,
  error: null,
  loaded: false,
  pendingIds: [], // id transaksi yang sedang diubah statusnya
  actionError: "",
};

export const useAdminTransactionStore = create((set, get) => ({
  ...initialState,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      // Dua request berjalan bersamaan. /all-transactions hanya berisi
      // userId, jadi nama & email pembeli diambil dari /all-user.
      const [transactions, users] = await Promise.all([
        getAllTransactions(),
        getAllUsers(),
      ]);
      // Ubah array user menjadi kamus supaya pencarian per userId instan,
      // tidak perlu users.find() untuk setiap baris transaksi.
      const usersById = Object.fromEntries(
        (Array.isArray(users) ? users : []).map((user) => [user.id, user]),
      );
      set({
        transactions: sortNewest(
          Array.isArray(transactions) ? transactions : [],
        ),
        usersById,
        loading: false,
        loaded: true,
      });
    } catch (error) {
      set({ loading: false, error, loaded: true });
    }
  },

  ensureLoaded: () => {
    const { loaded, loading, fetchAll } = get();
    if (loaded || loading) return;
    fetchAll();
  },

  changeStatus: async (transactionId, status) => {
    set((s) => ({
      actionError: "",
      pendingIds: [...s.pendingIds, transactionId],
    }));
    try {
      await updateTransactionStatus(transactionId, status);
      // Cukup ubah satu baris. Mengambil ulang semua transaksi membuat
      // daftar berkedip "Memuat..." setiap kali admin klik.
      set((s) => ({
        transactions: s.transactions.map((item) =>
          item.id === transactionId ? { ...item, status } : item,
        ),
      }));
      return true;
    } catch (error) {
      set({ actionError: getErrorMessage(error) });
      return false;
    } finally {
      set((s) => ({
        pendingIds: s.pendingIds.filter((id) => id !== transactionId),
      }));
    }
  },

  clearActionError: () => set({ actionError: "" }),

  reset: () => set({ ...initialState }),
}));
