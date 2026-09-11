import { Link } from "react-router";

import { ROUTES } from "@/constants";
import { demoFoods } from "@/data/demoFoods";
import { formatPrice } from "@/lib/format";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-[1110px] px-5 py-7 md:py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Lokasi Pengantaran</p>
          <h1 className="text-sm font-extrabold">Rumah (Andi Wijaya)</h1>
        </div>
        <Link to={ROUTES.CART} className="text-2xl text-primary">
          🛒
        </Link>
      </div>
      <div className="mt-5 flex max-w-md rounded-2xl bg-white px-4 py-3 text-sm text-slate-400 shadow-sm">
        ⌕　Cari menu favoritmu...
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto">
        {["Semua", "Nasi", "Sate", "Cemilan"].map((label, index) => (
          <button
            key={label}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold ${index === 0 ? "bg-primary text-white" : "bg-white text-navy"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-7 flex items-end justify-between">
        <h2 className="text-xl font-extrabold">Rekomendasi Hari Ini</h2>
        <Link to={ROUTES.FOODS} className="text-xs font-bold text-primary">
          Lihat semua
        </Link>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {demoFoods.slice(0, 2).map((food) => (
          <Link
            key={food.id}
            to={ROUTES.FOOD_DETAIL(food.id)}
            className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <img
              src={food.image}
              alt={food.name}
              className="h-24 w-24 rounded-lg object-cover"
            />
            <div>
              <h3 className="text-sm font-bold">{food.name}</h3>
              <p className="mt-1 text-sm font-extrabold text-primary">
                {formatPrice(food.price)}
              </p>
              <p className="mt-2 text-xs text-accent">
                ★ <b className="text-navy">{food.rating}</b>{" "}
                <span className="text-slate-500">({food.reviews} Ulasan)</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
