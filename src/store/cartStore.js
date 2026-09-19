// src/store/cartStore.js
import { create } from "zustand";

import { addCart, getCarts, deleteCart, updateCart } from "@/api/carts";
import { getErrorMessage } from "@/api/client";

const initialState = {
  carts: [],
  loading: false,
  error: null,
  actionError: "",
  adding: false,
  pendingIds: [], // cartId yang sedang diproses update/hapus
  loaded: false, // sudah pernah fetch atau belum
};

export const useCartStore = create((set, get) => {
  const startPending = (cartId) =>
    set((s) => ({ actionError: "", pendingIds: [...s.pendingIds, cartId] }));

  const stopPending = (cartId) =>
    set((s) => ({ pendingIds: s.pendingIds.filter((id) => id !== cartId) }));

  return {
    ...initialState,

    fetchCarts: async () => {
      set({ loading: true, error: null });
      try {
        const data = await getCarts();
        set({
          carts: Array.isArray(data) ? data : [],
          loading: false,
          loaded: true,
        });
      } catch (error) {
        set({ loading: false, error, loaded: true });
      }
    },

    // Dipanggil komponen saat mount. Fetch hanya sekali,
    // jadi Navbar + CartPage tidak menembak GET /carts dua kali.
    ensureLoaded: () => {
      const { loaded, loading, fetchCarts } = get();
      if (loaded || loading) return;
      fetchCarts();
    },

    addItem: async (foodId, quantity = 1) => {
      set({ actionError: "", adding: true });
      try {
        await addCart(foodId, quantity);
        // Inilah kuncinya: fetch ulang ke store yang sama,
        // sehingga badge di Navbar ikut berubah saat itu juga.
        await get().fetchCarts();
        return true;
      } catch (error) {
        set({ actionError: getErrorMessage(error) });
        return false;
      } finally {
        set({ adding: false });
      }
    },

    removeItem: async (cartId) => {
      startPending(cartId);
      try {
        await deleteCart(cartId);
        await get().fetchCarts();
        return true;
      } catch (error) {
        set({ actionError: getErrorMessage(error) });
        return false;
      } finally {
        stopPending(cartId);
      }
    },

    updateItem: async (cartId, quantity) => {
      startPending(cartId);
      try {
        await updateCart(cartId, quantity);
        await get().fetchCarts();
        return true;
      } catch (error) {
        set({ actionError: getErrorMessage(error) });
        return false;
      } finally {
        stopPending(cartId);
      }
    },

    changeQuantity: (cartId, quantity) => {
      if (quantity < 1) return;
      return get().updateItem(cartId, quantity);
    },

    // Dipanggil saat login/logout supaya keranjang akun lama tidak tertinggal.
    reset: () => set({ ...initialState }),
  };
});

// Selector: dipakai Navbar untuk angka kecil di ikon keranjang.
export const selectTotalQuantity = (state) =>
  state.carts.reduce((total, item) => total + Number(item.quantity || 0), 0);
