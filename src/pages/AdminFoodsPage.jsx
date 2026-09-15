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

const inputClass =
  "mt-2 w-full border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-primary";

function matchesKeyword(food, keyword) {
  const haystack = [food.name, food.description, ...(food.ingredients || [])];
  return haystack.some((text) =>
    String(text || "")
      .toLowerCase()
      .includes(keyword),
  );
}

function CreateFoodForm({ onCreated, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState({ loading: false, error: "" });

  const update = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    if (form.password !== form.passwordRepeat) {
      setStatus({
        loading: false,
        error: "Password dan ulangi password tidak sama.",
      });
      return;
    }
    setStatus({ loading: true, error: "" });
    try {
      const { phoneNumber, ...payload } = form;
      await registerUser(phoneNumber ? { ...payload, phoneNumber } : payload);
      onCreated(form.email);
    } catch (error) {
      setStatus({ loading: false, error: getErrorMessage(error) });
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mt-6 border border-slate-200 bg-white p-6 shadow-[6px_6px_0_#2e6dfa]"
    >
      <h2 className="text-lg font-extrabold">Tambah makanan</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block text-base font-bold">
          Nama
          <input
            required
            name="name"
            value={form.name}
            onChange={update}
            className={inputClass}
          />
        </label>
        <label className="block text-base font-bold">
          Harga
          <input
            required
            type="number"
            name="price"
            value={form.price}
            onChange={update}
            className={inputClass}
          />
        </label>
        <label className="block text-base font-bold">
          Gambar
          <input
            type="text"
            name="image"
            value={form.image}
            onChange={update}
            className={inputClass}
          />
        </label>
        <label className="block text-base font-bold">
          Deskripsi
          <textarea
            name="description"
            value={form.description}
            onChange={update}
            className={inputClass}
          />
        </label>
      </div>
      {status.error && (
        <p className="mt-4 bg-red-50 p-3 text-base text-red-700">
          {status.error}
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          disabled={status.loading}
          className="bg-primary px-5 py-2 font-bold text-white disabled:opacity-60"
        >
          {status.loading ? "Menyimpan..." : "Simpan makanan"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-slate-300 px-5 py-2 font-bold"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

export default function AdminFoodsPage() {
  const { foods, loading, error, refetch } = useFoods();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [notice, setNotice] = useState(
    location.state?.notice || { type: "", text: "" },
  );

  //   useEffect(() => {
  //     setCurrentUserId(authStorage.getUser()?.id ?? null);
  //   }, []);

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

  const handleCreated = async (email) => {
    setShowForm(false);
    setNotice({
      type: "success",
      text: `Makanan ${email} berhasil ditambahkan.`,
    });
    refetch();
  };

  const removeFood = async (food) => {
    if (!food) return;

    setDeletingId(food.id);
    try {
      await deleteFood(food.id);
      refetch();
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
      <div className="flex flex-wrap items-end justify-between gap-4">
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
          {!showForm && (
            <Link
              to={ROUTES.ADMIN_CREATE_FOOD}
              className="bg-primary px-4 py-2 font-bold text-white"
            >
              + Tambah makanan
            </Link>
          )}
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
                    {/* baris makanan, lihat F4 */}
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
