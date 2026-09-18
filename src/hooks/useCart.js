import { useCallback, useEffect, useMemo, useState } from "react";

import { addCart, getCarts } from "@/api/carts";
import { getErrorMessage } from "@/api/client";

// enabled: false dipakai untuk role selain user (misalnya admin), supaya
// halaman tidak memanggil endpoint keranjang yang memang bukan untuknya.
export function useCart({ enabled = true } = {}) {
  const [carts, setCarts] = useState([]);
  const [state, setState] = useState({ loading: enabled, error: null });
  const [actionError, setActionError] = useState("");
  // adding dipakai untuk menonaktifkan tombol selama request berjalan.
  const [adding, setAdding] = useState(false);
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

  return {
    carts,
    ...state,
    actionError,
    adding,
    totalQuantity,
    addItem,
    refetch,
  };
}
