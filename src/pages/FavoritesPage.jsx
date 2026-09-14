import { Link } from "react-router";

import { getErrorMessage } from "@/api/client";
import FoodList from "@/components/FoodList";
import { ROUTES } from "@/constants";
import { useFavorites } from "@/hooks/useFavorites";

export default function FavoritesPage() {
  const {
    favorites,
    loading,
    error,
    actionError,
    isFavorite,
    isPending,
    toggleFavorite,
    refetch,
  } = useFavorites();

  return (
    <section className="mx-auto max-w-[1110px] px-5 py-7 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Favorit Saya</h1>
          {!loading && !error && (
            <p className="mt-1 text-base text-slate-500">
              {favorites.length} menu tersimpan
            </p>
          )}
        </div>
        <button
          onClick={refetch}
          className="rounded-lg border border-slate-300 px-4 py-2 text-base font-bold"
        >
          Muat ulang
        </button>
      </div>

      {actionError && (
        <p className="mt-6 rounded-lg bg-red-50 p-3 text-base text-red-700">
          {actionError}
        </p>
      )}

      {loading && <p className="mt-6 text-slate-500">Memuat favorit...</p>}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
          Gagal memuat favorit: {getErrorMessage(error)}
        </div>
      )}

      {!loading && !error && favorites.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <p className="text-4xl text-accent">♡</p>
          <p className="mt-3 text-base text-slate-500">
            Belum ada menu favorit. Tekan ♡ pada menu yang kamu suka.
          </p>
          <Link
            to={ROUTES.FOODS}
            className="mt-5 inline-block rounded-lg bg-primary px-5 py-2 font-bold text-white"
          >
            Jelajahi Makanan
          </Link>
        </div>
      )}

      {!loading && !error && favorites.length > 0 && (
        <div className="mt-6">
          <FoodList
            foods={favorites}
            isFavorite={isFavorite}
            isFavoritePending={isPending}
            onToggleFavorite={toggleFavorite}
          />
        </div>
      )}
    </section>
  );
}
