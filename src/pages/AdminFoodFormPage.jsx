import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { getErrorMessage } from "@/api/client";
import { createFood, updateFood } from "@/api/foods";
import { ROUTES } from "@/constants";

import { useFoodDetail } from "@/hooks/useFoods";

const EMPTY_FORM = {
  name: "",
  description: "",
  imageUrl: "",
  ingredients: "",
  price: "",
  priceDiscount: "",
};

const inputClass =
  "mt-2 w-full border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-primary";

function FoodForm({ mode, foodId, initialFood }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(
    initialFood
      ? {
          name: initialFood.name || "",
          description: initialFood.description || "",
          imageUrl: initialFood.imageUrl || "",
          ingredients: (initialFood.ingredients || []).join(", "),
          price: initialFood.price ?? "",
          priceDiscount: initialFood.priceDiscount ?? "",
        }
      : EMPTY_FORM,
  );
  const [status, setStatus] = useState({ loading: false, error: "" });
  const [imageError, setImageError] = useState(false);

  const update = (event) => {
    if (event.target.name === "imageUrl") setImageError(false);
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = async (event) => {
    event.preventDefault();
    const price = Number(form.price);
    const priceDiscount = Number(form.priceDiscount || 0);

    if (priceDiscount > price) {
      setStatus({
        loading: false,
        error: "Harga diskon tidak boleh lebih besar dari harga.",
      });
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      ingredients: form.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      price,
      priceDiscount,
    };

    setStatus({ loading: true, error: "" });
    try {
      if (mode === "edit") await updateFood(foodId, payload);
      else await createFood(payload);

      navigate(ROUTES.ADMIN_FOODS, {
        state: {
          notice: {
            type: "success",
            text: `${payload.name} berhasil ${mode === "edit" ? "diperbarui" : "ditambahkan"}.`,
          },
        },
      });
    } catch (error) {
      setStatus({ loading: false, error: getErrorMessage(error) });
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mt-6 max-w-3xl border border-slate-200 bg-white p-6 shadow-[6px_6px_0_#2e6dfa]"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col md:col-span-2">
          <span className="font-bold">Nama</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={update}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col">
          <span className="font-bold">Harga</span>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={update}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col">
          <span className="font-bold">Harga Diskon</span>
          <input
            type="number"
            name="priceDiscount"
            value={form.priceDiscount}
            onChange={update}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col">
          <span className="font-bold">URL Gambar</span>
          <input
            type="url"
            name="imageUrl"
            value={form.imageUrl}
            onChange={update}
            placeholder="https://example.com/image.jpg"
            className={inputClass}
            re
          />
        </label>

        <label className="flex flex-col md:col-span-2">
          <span className="font-bold">Deskripsi</span>
          <textarea
            name="description"
            value={form.description}
            onChange={update}
            rows={4}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col md:col-span-2">
          <span className="font-bold">Bahan</span>
          <textarea
            name="ingredients"
            value={form.ingredients}
            onChange={update}
            rows={4}
            className={inputClass}
          />
        </label>
      </div>

      {form.imageUrl && (
        <>
          {imageError ? (
            <p className="mt-4 border border-amber-200 bg-amber-50 p-3 text-base text-amber-800">
              URL gambar tidak bisa dimuat. Periksa kembali alamatnya.
            </p>
          ) : (
            <img
              src={form.imageUrl}
              alt="Preview"
              className="mt-4 h-48 w-full rounded-lg object-cover"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          )}
        </>
      )}

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
        <Link
          to={ROUTES.ADMIN_FOODS}
          className="border border-slate-300 px-5 py-2 font-bold"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}

export default function AdminFoodFormPage({ mode }) {
  const { foodId } = useParams();
  const isEdit = mode === "edit";
  const { food, loading, error } = useFoodDetail(isEdit ? foodId : undefined);

  if (isEdit && loading)
    return <p className="text-slate-500">Memuat data makanan...</p>;

  if (isEdit && error)
    return (
      <div className="border border-red-200 bg-red-50 p-5 text-red-700">
        Gagal memuat makanan: {getErrorMessage(error)}
      </div>
    );

  return (
    <div>
      <p className="text-base font-bold uppercase tracking-[0.2em] text-accent">
        Manage foods
      </p>
      <h1 className="mt-2 text-3xl font-black text-navy">
        {isEdit ? "Edit Makanan" : "Tambah Makanan"}
      </h1>
      <FoodForm
        key={foodId || "create"}
        mode={mode}
        foodId={foodId}
        initialFood={food}
      />
    </div>
  );
}
