import { useMemo, useState } from "react";
import { useLocation, Link } from "react-router";
import { getErrorMessage } from "@/api/client";
import Pagination from "@/components/Pagination";
import { ROUTES } from "@/constants";
import { useFoods } from "@/hooks/useFoods";
import { deleteFood } from "@/api/foods";
import { FALLBACK_FOOD_IMAGE } from "@/data/demoFoods";
import { formatPrice } from "@/lib/format";

const PER_PAGE = 10;

function matchesKeyword(food, keyword) {
  const haystack = [food.name, food.description, ...(food.ingredients || [])];
  return haystack.some((text) =>
    String(text || "")
      .toLowerCase()
      .includes(keyword),
  );
}

export default function AdminFoodsPage() {
  const { foods, setFoods, loading, error, refetch } = useFoods();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [deletingId, setDeletingId] = useState(null);

  const [notice, setNotice] = useState(
    location.state?.notice || { type: "", text: "" },
  );

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return foods;
    return foods.filter((food) => matchesKeyword(food, keyword));
  }, [foods, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visibleFoods = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  const removeFood = async (food) => {
    if (
      !window.confirm(`Apakah Anda yakin ingin menghapus makanan ${food.name}?`)
    ) {
      return;
    }

    setDeletingId(food.id);
    setNotice({ type: "", text: "" });
    try {
      await deleteFood(food.id);
      setFoods((list) => list.filter((f) => f.id !== food.id));
      setNotice({
        type: "success",
        text: `Makanan ${food.name} berhasil dihapus.`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        text: `Gagal menghapus makanan ${food.name}: ${getErrorMessage(error)}`,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex  flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-base font-bold uppercase tracking-[0.2em] text-accent">
            Manage foods
          </p>
          <h1 className="mt-2 text-3xl font-black text-navy">Daftar Makanan</h1>
          {!loading && !error && (
            <p className="mt-1 text-base text-slate-500">
              {filtered.length} makanan
              {query && ` cocok dengan "${query.trim()}"`}
              {totalPages > 1 && ` · halaman ${currentPage} dari ${totalPages}`}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={refetch}
            className="border border-slate-300 bg-white px-4 py-2 font-bold"
          >
            Muat ulang
          </button>

          <Link
            to={ROUTES.ADMIN_CREATE_FOOD}
            className="bg-primary px-4 py-2 font-bold text-white"
          >
            + Tambah makanan
          </Link>
        </div>
      </div>

      {notice.text && (
        <p
          className={`mt-4 p-3 text-base ${
            notice.type === "error"
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {notice.text}
        </p>
      )}

      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setPage(1);
        }}
        placeholder="Cari nama, deskripsi, atau bahan..."
        className="mt-6 w-full max-w-md border border-slate-300 bg-white px-4 py-2 outline-none focus:border-primary"
      />

      {loading && <p className="mt-6 text-slate-500">Memuat makanan...</p>}
      {error && (
        <div className="mt-6 border border-red-200 bg-red-50 p-5 text-red-700">
          Gagal memuat makanan: {getErrorMessage(error)}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mt-4 overflow-x-auto border border-slate-200 bg-white">
            <table className="w-full min-w-[860px] text-left text-base">
              <thead className="bg-slate-50 text-sm uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Foto</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Harga</th>
                  <th className="px-4 py-3">Diskon</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Likes</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {visibleFoods.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Tidak ada makanan.
                    </td>
                  </tr>
                )}
                {visibleFoods.map((food) => (
                  <tr key={food.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <img
                        src={food.imageUrl || FALLBACK_FOOD_IMAGE}
                        alt=""
                        onError={(event) => {
                          event.currentTarget.src = FALLBACK_FOOD_IMAGE;
                        }}
                        className="h-12 w-16 rounded object-cover"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{food.name || "-"}</p>
                      <p className="line-clamp-1 text-sm text-slate-500">
                        {food.description}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {formatPrice(food.price || 0)}
                    </td>
                    <td className="px-4 py-3">
                      {food.priceDiscount
                        ? formatPrice(food.priceDiscount)
                        : "-"}
                    </td>
                    <td className="px-4 py-3">★ {food.rating || "-"}</td>
                    <td className="px-4 py-3">{food.totalLikes || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          to={ROUTES.ADMIN_EDIT_FOOD(food.id)}
                          className="border border-slate-300 px-3 py-1 font-bold"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFood(food)}
                          disabled={deletingId === food.id}
                          className="bg-red-600 px-3 py-1 font-bold text-white disabled:opacity-60"
                        >
                          {deletingId === food.id ? "Menghapus..." : "Hapus"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
