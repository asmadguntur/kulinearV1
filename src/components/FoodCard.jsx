import { Link } from "react-router";

import { ROUTES } from "@/constants";
import { FALLBACK_FOOD_IMAGE } from "@/data/demoFoods";
import { formatPrice } from "@/lib/format";

// Tombol favorit hanya tampil kalau onToggleFavorite dikirim, yaitu untuk role user.
export default function FoodCard({
  food,
  isFavorite = false,
  favoritePending = false,
  onToggleFavorite,
}) {
  const showFallbackImage = (event) => {
    event.currentTarget.src = FALLBACK_FOOD_IMAGE;
  };

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <img
        src={food.imageUrl || FALLBACK_FOOD_IMAGE}
        alt={food.name}
        onError={showFallbackImage}
        className="h-40 w-full object-cover"
      />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="rounded bg-orange-50 px-2 py-1 text-base font-bold text-accent">
            Populer
          </span>
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(food)}
              disabled={favoritePending}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? "Hapus dari favorit" : "Simpan ke favorit"}
              className="grid h-8 w-8 place-items-center rounded-full text-lg text-accent hover:bg-orange-50 disabled:opacity-50"
            >
              {isFavorite ? "♥" : "♡"}
            </button>
          )}
        </div>
        <h2 className="mt-3 text-base font-bold">
          {food.name || "Unnamed food"}
        </h2>
        <p className="mt-1 text-base font-extrabold text-primary">
          {formatPrice(food.price || 0)}
        </p>
        <div className="mt-3 flex items-center justify-between text-base text-slate-500">
          <span className="text-accent">
            ★ <b className="text-navy">{food.rating || "-"}</b> (
            {food.totalLikes || 0} Ulasan)
          </span>
          <Link
            to={ROUTES.FOOD_DETAIL(food.id)}
            className="rounded bg-primary px-3 py-1.5 font-bold text-white"
          >
            Pesan
          </Link>
        </div>
      </div>
    </article>
  );
}
