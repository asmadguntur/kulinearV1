import { useCallback, useEffect, useMemo, useState } from "react";

import { addCart, getCarts, deleteCart, updateCart } from "@/api/carts";
import { getErrorMessage } from "@/api/client";

// enabled: false dipakai untuk role selain user (misalnya admin), supaya
// halaman tidak memanggil endpoint keranjang yang memang bukan untuknya.
export function useCart({ enabled = true } = {}) {
  const [carts, setCarts] = useState([]);
  const [state, setState] = useState({ loading: enabled, error: null });
  const [actionError, setActionError] = useState("");
  // adding dipakai untuk menonaktifkan tombol selama request berjalan.
  const [adding, setAdding] = useState(false);

  // menyimpan cartId yang sedang diproses update/delete, supaya tombolnya bisa dinonaktifkan.
  const [pendingId, setPendingId] = useState([]);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    getCarts()
      .then((data) => {
        if (!active) return;
        setCarts(Array.isArray(data) ? data : []);
        setState({ loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [enabled, reloadKey]);

  const refetch = useCallback(() => {
    setState({ loading: true, error: null });
    setReloadKey((key) => key + 1);
  }, []);

  // Jumlah seluruh item, dipakai untuk angka kecil di ikon keranjang navbar.
  const totalQuantity = useMemo(
    () => carts.reduce((total, item) => total + (item.quantity || 0), 0),
    [carts],
  );

  const addItem = useCallback(
    async (foodId, quantity = 1) => {
      setActionError("");
      setAdding(true);
      try {
        await addCart(foodId, quantity);
        // Ambil ulang isi keranjang supaya id cart dan jumlahnya persis
        // sama dengan yang tersimpan di server.
        refetch();
        return true;
      } catch (error) {
        setActionError(getErrorMessage(error));
        return false;
      } finally {
        setAdding(false);
      }
    },
    [refetch],
  );

  const removeItem = useCallback(
    async (cartId) => {
      setActionError("");
      setPendingId((ids) => [...ids, cartId]);
      try {
        await deleteCart(cartId);
        refetch();
        return true;
      } catch (error) {
        setActionError(getErrorMessage(error));
        return false;
      } finally {
        setPendingId((ids) => ids.filter((id) => id !== cartId));
      }
    },
    [refetch],
  );

  const changeQuantity = useCallback(
    async (cartId, step) => {
      const cart = carts.find((item) => item.id === cartId);
      if (!cart) return false;
      const newQuantity = Math.max(1, cart.quantity + step);
      return updateItem(cartId, newQuantity);
    },
    [carts],
  );

  const updateItem = useCallback(
    async (cartId, quantity) => {
      setActionError("");
      setPendingId((ids) => [...ids, cartId]);
      try {
        await updateCart(cartId, quantity);
        refetch();
        return true;
      } catch (error) {
        setActionError(getErrorMessage(error));
        return false;
      } finally {
        setPendingId((ids) => ids.filter((id) => id !== cartId));
      }
    },
    [refetch],
  );

  const isPending = useCallback(
    (cartId) => pendingId.includes(cartId),
    [pendingId],
  );

  return {
    carts,
    ...state,
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
