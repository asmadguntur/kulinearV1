import { useCallback, useEffect } from "react";

import { selectTotalQuantity, useCartStore } from "@/store/cartStore";

// enabled: false dipakai untuk role selain user (admin / belum login),
// supaya endpoint keranjang tidak dipanggil.
export function useCart({ enabled = true } = {}) {
  // Ambil per-field, jangan kembalikan object baru dari selector —
  // di Zustand v5 itu memicu re-render tak berujung.
  const carts = useCartStore((s) => s.carts);
  const loading = useCartStore((s) => s.loading);
  const loaded = useCartStore((s) => s.loaded);
  const error = useCartStore((s) => s.error);
  const actionError = useCartStore((s) => s.actionError);
  const adding = useCartStore((s) => s.adding);
  const pendingIds = useCartStore((s) => s.pendingIds);
  const totalQuantity = useCartStore(selectTotalQuantity);

  // Action di Zustand referensinya stabil, aman dipakai di dependency array.
  const ensureLoaded = useCartStore((s) => s.ensureLoaded);
  const refetch = useCartStore((s) => s.fetchCarts);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateItem = useCartStore((s) => s.updateItem);
  const changeQuantity = useCartStore((s) => s.changeQuantity);

  useEffect(() => {
    if (enabled) ensureLoaded();
  }, [enabled, ensureLoaded]);

  const isPending = useCallback(
    (cartId) => pendingIds.includes(cartId),
    [pendingIds],
  );

  return {
    carts,
    // Selama fetch pertama belum jalan, tetap anggap loading supaya
    // CartPage tidak sempat menampilkan keranjang kosong.
    loading: enabled && (loading || !loaded),
    error,
    actionError,
    adding,
    totalQuantity,
    addItem,
    refetch,
    removeItem,
    changeQuantity,
    updateItem,
    isPending,
  };
}
