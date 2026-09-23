import { useMemo, useState } from "react";
import { Link } from "react-router";

import FoodList from "@/components/FoodList";
import { ROLES, ROUTES } from "@/constants";
import { useFavorites } from "@/hooks/useFavorites";
import { useFoods } from "@/hooks/useFoods";
import { authStorage } from "@/lib/authStorage";
import Pagination from "@/components/Pagination";
import { pickDailyRecommendations } from "@/lib/recommendation";

const PER_PAGE = 12;
const DAILY_COUNT = 8;

const FILTERS = [
  { value: "all", label: "Semua" },
  { value: "daily", label: "Rekomendasi Hari Ini" },
];

function matchesKeyword(food, keyword) {
  const haystack = [food.name, food.description, ...(food.ingredients || [])];
  return haystack.some((text) =>
    String(text || "")
      .toLowerCase()
      .includes(keyword),
  );
}

export default function FoodPage() {
  const { foods, loading, error, refetch } = useFoods();
  // Favorit hanya untuk role user; admin tidak melihat tombol ♡.
  const isUser = authStorage.getUser()?.role === ROLES.USER;
  const user = authStorage.getUser();
  const favorite = useFavorites({ enabled: isUser });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const recommended = useMemo(
    () => pickDailyRecommendations(foods, DAILY_COUNT),
    [foods],
  );

  const filtered = useMemo(() => {
    const source = filter === "daily" ? recommended : foods;
    const keyword = query.trim().toLowerCase();
    if (!keyword) return source;
    return source.filter((food) => matchesKeyword(food, keyword));
  }, [foods, recommended, filter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  // Jaga-jaga kalau daftar menyusut setelah dicari: halaman aktif ikut mundur.
  const currentPage = Math.min(page, totalPages);
  const visibleFoods = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  const changeQuery = (event) => {
    setQuery(event.target.value);
    setPage(1);
  };

  const changeFilter = (value) => {
    setFilter(value);
    setPage(1);
  };

  const changePage = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-[1110px] px-5 py-7 md:py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            Halo, {user?.name ?? "Pencinta Rasa"}! 👋
          </h1>
          <p className="mt-2 text-sm text-muted">
            Mau berburu kelezatan apa hari ini? Temukan rekomendasi spesial
            Anda.
          </p>
        </div>
        <Link to={ROUTES.CART} className="text-2xl text-primary">
          🛒
        </Link>
      </div>

      <label className="mt-5 flex max-w-md items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
        <span className="text-slate-400">⌕</span>
        <input
          value={query}
          onChange={changeQuery}
          placeholder="Cari menu favoritmu..."
          className="min-w-0 flex-1 bg-transparent text-base text-navy outline-none placeholder:text-slate-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => changeQuery({ target: { value: "" } })}
            aria-label="Hapus pencarian"
            className="text-slate-400 hover:text-navy"
          >
            ✕
          </button>
        )}
      </label>

      <div className="mt-6 flex gap-2 overflow-x-auto">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => changeFilter(value)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-base font-semibold ${
              filter === value ? "bg-primary text-white" : "bg-white text-navy"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold">
            {filter === "daily" ? "Rekomendasi Hari Ini" : "Semua Menu"}
          </h2>
          {!loading && !error && (
            <p className="mt-1 text-base text-slate-500">
              {filtered.length} menu
              {query && ` cocok dengan "${query.trim()}"`}
              {totalPages > 1 && ` · halaman ${currentPage} dari ${totalPages}`}
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

      {favorite.actionError && (
        <p className="mt-6 rounded-lg bg-red-50 p-3 text-base text-red-700">
          {favorite.actionError}
        </p>
      )}

      {loading && <p className="mt-6 text-slate-500">Memuat menu...</p>}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
          Gagal memuat menu. Periksa `VITE_API_URL` dan akses API.
        </div>
      )}
      {!loading && !error && (
        <>
          <div className="mt-4">
            <FoodList
              foods={visibleFoods}
              isFavorite={favorite.isFavorite}
              isFavoritePending={favorite.isPending}
              onToggleFavorite={isUser ? favorite.toggleFavorite : undefined}
            />
          </div>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={changePage}
          />
        </>
      )}
    </section>
  );
}
