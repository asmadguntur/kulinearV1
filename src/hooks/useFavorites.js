import { useCallback, useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "@/api/client";
import { getLikedFoods, likeFood, unlikeFood } from "@/api/favorites";

// enabled: false dipakai untuk role selain user (misalnya admin), supaya
// halaman tidak memanggil endpoint favorit yang memang bukan untuknya.
export function useFavorites({ enabled = true } = {}) {
  const [favorites, setFavorites] = useState([]);
  const [state, setState] = useState({ loading: enabled, error: null });
  const [actionError, setActionError] = useState("");
  // Id makanan yang sedang diproses, supaya tombolnya tidak diklik dua kali.
  const [pendingIds, setPendingIds] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    getLikedFoods()
      .then((data) => {
        if (!active) return;
        setFavorites(Array.isArray(data) ? data : []);
        setState({ loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [enabled, reloadKey]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((food) => food.id)),
    [favorites],
  );

  const refetch = useCallback(() => {
    setState({ loading: true, error: null });
    setReloadKey((key) => key + 1);
  }, []);

  const toggleFavorite = useCallback(
    async (food) => {
      const liked = favoriteIds.has(food.id);
      const add = (list) => [...list, food];
      const remove = (list) => list.filter((item) => item.id !== food.id);

      setActionError("");
      setPendingIds((ids) => [...ids, food.id]);
      // Ubah tampilan dulu supaya terasa cepat, lalu kembalikan kalau API gagal.
      setFavorites(liked ? remove : add);
      try {
        if (liked) await unlikeFood(food.id);
        else await likeFood(food.id);
      } catch (error) {
        setFavorites(liked ? add : remove);
        setActionError(getErrorMessage(error));
      } finally {
        setPendingIds((ids) => ids.filter((id) => id !== food.id));
      }
    },
    [favoriteIds],
  );

  const isFavorite = useCallback((foodId) => favoriteIds.has(foodId), [
    favoriteIds,
  ]);

  const isPending = useCallback((foodId) => pendingIds.includes(foodId), [
    pendingIds,
  ]);

  return {
    favorites,
    ...state,
    actionError,
    isFavorite,
    isPending,
    toggleFavorite,
    refetch,
  };
}
