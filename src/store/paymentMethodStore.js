import { create } from "zustand";

import { getPaymentMethods } from "@/api/paymentMethods";

const initialState = {
  methods: [], // [{ id, name, imageUrl }]
  loading: false,
  error: null,
  loaded: false, // sudah pernah fetch atau belum
  selectedId: "", // id bank yang dipilih user di CartPage
};

export const usePaymentMethodStore = create((set, get) => ({
  ...initialState,

  fetchMethods: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getPaymentMethods();
      const methods = Array.isArray(data) ? data : [];
      set((state) => ({
        methods,
        loading: false,
        loaded: true,
        // Kalau bank yang sedang dipilih ternyata tidak ada di daftar baru,
        // lepaskan pilihannya supaya checkout tidak mengirim id yang salah.
        selectedId: methods.some((method) => method.id === state.selectedId)
          ? state.selectedId
          : "",
      }));
    } catch (error) {
      // loaded tetap true supaya halaman berhenti menampilkan "Memuat...".
      set({ loading: false, error, loaded: true });
    }
  },

  // Daftar bank jarang berubah: cukup di-fetch sekali per sesi login.
  // User & admin memakai data yang sama, jadi tidak ada request ganda.
  ensureLoaded: () => {
    const { loaded, loading, fetchMethods } = get();
    if (loaded || loading) return;
    fetchMethods();
  },

  select: (methodId) => set({ selectedId: methodId }),

  // Dipanggil setelah checkout berhasil, supaya transaksi berikutnya
  // tidak diam-diam memakai bank yang sama.
  clearSelection: () => set({ selectedId: "" }),

  // Dipanggil saat login/logout, sama seperti cartStore.reset().
  reset: () => set({ ...initialState }),
}));

// Selector: objek bank yang sedang dipilih, atau null.
// Aman untuk Zustand karena mengembalikan objek yang SUDAH ADA di methods
// (referensinya stabil), bukan membuat objek baru.
export const selectSelectedMethod = (state) =>
  state.methods.find((method) => method.id === state.selectedId) || null;
