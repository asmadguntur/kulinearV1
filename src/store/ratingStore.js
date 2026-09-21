import { create } from "zustand";

import { getErrorMessage } from "@/api/client";
import { getFoodRatings, rateFood } from "@/api/ratings";

// Nilai balik saat sebuah foodId belum pernah di-fetch.
// WAJIB konstanta di luar store. Kalau kita bikin objek baru setiap kali
// selector dipanggil, Zustand menganggap nilainya selalu berubah dan
// komponen akan re-render tanpa henti.
const EMPTY_ENTRY = { ratings: [], loading: false, error: null, loaded: false };

const initialState = {
  // Kamus per makanan: { [foodId]: { ratings, loading, error, loaded } }
  byFood: {},
  // submitting & actionError sengaja global, bukan per makanan,
  // karena form ulasan cuma ada satu di layar pada satu waktu.
  submitting: false,
  actionError: "",
};

export const useRatingStore = create((set, get) => {
  // Mengubah satu entri tanpa menimpa entri makanan lain.
  // Perhatikan: byFood diganti objek baru, tidak pernah dimutasi langsung.
  const patchEntry = (foodId, patch) =>
    set((state) => ({
      byFood: {
        ...state.byFood,
        [foodId]: { ...(state.byFood[foodId] || EMPTY_ENTRY), ...patch },
      },
    }));

  return {
    ...initialState,

    fetchRatings: async (foodId) => {
      if (!foodId) return;
      patchEntry(foodId, { loading: true, error: null });
      try {
        const data = await getFoodRatings(foodId);
        patchEntry(foodId, {
          ratings: Array.isArray(data) ? data : [],
          loading: false,
          loaded: true,
        });
      } catch (error) {
        // loaded tetap true supaya halaman berhenti menampilkan "Memuat...".
        patchEntry(foodId, { loading: false, error, loaded: true });
      }
    },

    // Dipanggil komponen saat mount. Kalau makanan ini sudah pernah di-fetch,
    // tidak ada request baru — inilah yang membuat pindah halaman terasa instan.
    ensureLoaded: (foodId) => {
      if (!foodId) return;
      const entry = get().byFood[foodId];
      if (entry?.loaded || entry?.loading) return;
      get().fetchRatings(foodId);
    },

    submitRating: async (foodId, { rating, review }) => {
      set({ actionError: "" });

      // Validasi di sisi klien dulu supaya tidak boros request.
      if (!rating) {
        set({ actionError: "Pilih dulu berapa bintang." });
        return false;
      }
      if (!review.trim()) {
        set({ actionError: "Ulasan tidak boleh kosong." });
        return false;
      }

      set({ submitting: true });
      try {
        await rateFood(foodId, {
          rating: Number(rating),
          review: review.trim(),
        });
        // Ambil ulang ke store yang sama, sehingga halaman detail dan halaman
        // rating sama-sama menampilkan angka terbaru.
        await get().fetchRatings(foodId);
        return true;
      } catch (error) {
        set({ actionError: getErrorMessage(error) });
        return false;
      } finally {
        set({ submitting: false });
      }
    },

    clearActionError: () => set({ actionError: "" }),

    // Dipanggil saat login/logout, sama seperti cartStore.reset().
    reset: () => set({ ...initialState, byFood: {} }),
  };
});

// Selector: mengembalikan entri APA ADANYA. Referensinya stabil karena hanya
// berubah saat patchEntry() dijalankan, jadi aman dipakai di useRatingStore().
export const selectFoodEntry = (foodId) => (state) =>
  state.byFood[foodId] || EMPTY_ENTRY;
