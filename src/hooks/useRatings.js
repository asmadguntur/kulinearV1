import { useCallback, useEffect, useMemo } from "react";

import { selectFoodEntry, useRatingStore } from "@/store/ratingStore";

export function useRatings(foodId) {
  // Satu entri = { ratings, loading, error, loaded } milik foodId ini saja.
  const entry = useRatingStore(selectFoodEntry(foodId));

  // Action di Zustand referensinya stabil, aman dipakai di dependency array.
  const ensureLoaded = useRatingStore((s) => s.ensureLoaded);
  const fetchRatings = useRatingStore((s) => s.fetchRatings);
  const submit = useRatingStore((s) => s.submitRating);
  const clearActionError = useRatingStore((s) => s.clearActionError);
  const submitting = useRatingStore((s) => s.submitting);
  const actionError = useRatingStore((s) => s.actionError);

  useEffect(() => {
    // Bersihkan error form lama: karena actionError global, pesan error dari
    // makanan sebelumnya bisa ikut terbawa saat pindah halaman.
    clearActionError();
    ensureLoaded(foodId);
  }, [foodId, ensureLoaded, clearActionError]);

  const ratings = entry.ratings;
  const total = ratings.length;

  // Rata-rata dihitung dari daftar, bukan diambil dari food.rating,
  // supaya angkanya langsung berubah begitu ulasan baru masuk.
  const average = useMemo(() => {
    if (total === 0) return 0;
    const sum = ratings.reduce(
      (acc, item) => acc + Number(item.rating || 0),
      0,
    );
    return sum / total;
  }, [ratings, total]);

  // Jumlah ulasan per bintang: { 5: 6, 4: 0, 3: 2, 2: 0, 1: 0 }
  const distribution = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach((item) => {
      const star = Math.round(Number(item.rating || 0));
      if (counts[star] !== undefined) counts[star] += 1;
    });
    return counts;
  }, [ratings]);

  const refetch = useCallback(
    () => fetchRatings(foodId),
    [fetchRatings, foodId],
  );

  const submitRating = useCallback(
    (payload) => submit(foodId, payload),
    [submit, foodId],
  );

  return {
    ratings,
    // Selama fetch pertama belum selesai, tetap anggap loading supaya halaman
    // tidak sempat menampilkan "belum ada ulasan" padahal datanya sedang jalan.
    loading: Boolean(foodId) && (entry.loading || !entry.loaded),
    error: entry.error,
    actionError,
    submitting,
    total,
    average,
    distribution,
    submitRating,
    refetch,
  };
}
