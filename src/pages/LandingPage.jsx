import { Link } from "react-router";

import { ROUTES } from "@/constants";
import { demoFoods } from "@/data/demoFoods";
import { formatPrice } from "@/lib/format";

export default function LandingPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy text-white">
        <img
          src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1800&q=85"
          alt="Indonesian food spread"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy/95 via-navy/60 to-navy/20" />
        <div className="mx-auto max-w-[1110px] px-5 py-20 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
            Rasa Nusantara, di depan pintu
          </p>
          <h1 className="mt-4 max-w-lg text-4xl font-extrabold leading-tight md:text-6xl">
            Nikmati Cita Rasa Kuliner Nusantara Terbaik
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-slate-200 md:text-base">
            Pesan makanan tradisional dan modern favoritmu langsung diantar ke
            depan pintu rumah dengan aman dan hangat.
          </p>
          <div className="mt-7 flex max-w-md overflow-hidden rounded-full bg-white p-1">
            <span className="px-4 py-3 text-slate-400">⌕</span>
            <input
              className="min-w-0 flex-1 bg-transparent text-sm text-navy outline-none"
              placeholder="Cari sate, nasi goreng, gado-gado..."
            />
            <button className="rounded-full bg-accent px-7 py-2 text-sm font-bold text-white">
              Cari
            </button>
          </div>
        </div>
      </section>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1110px] gap-2 overflow-x-auto px-5 py-5 text-xs font-semibold">
          <button className="rounded-full bg-primary px-4 py-2 text-white">
            Semua
          </button>
          {[
            "Nasi & Ayam",
            "Sate & Bakaran",
            "Soto & Sop",
            "Minuman Tradisional",
            "Cemilan",
          ].map((category) => (
            <button
              key={category}
              className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-600"
            >
              {category}
            </button>
          ))}
          <span className="ml-auto hidden items-center gap-2 whitespace-nowrap text-slate-400 md:flex">
            Urutkan: <strong className="text-primary">Terpopuler⌄</strong>
          </span>
        </div>
      </section>
      <section className="mx-auto max-w-[1110px] px-5 py-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
              Pilihan untukmu
            </p>
            <h2 className="mt-2 text-xl font-extrabold md:text-2xl">
              Menu Rekomendasi Terlaris
            </h2>
          </div>
          <Link to={ROUTES.FOODS} className="text-xs font-bold text-primary">
            Lihat semua →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {demoFoods.map((food) => (
            <article
              key={food.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <img
                src={food.image}
                alt={food.name}
                className="h-32 w-full object-cover"
              />
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-orange-50 px-2 py-1 text-[10px] font-bold text-accent">
                    Populer
                  </span>
                  <span className="text-lg text-accent">♡</span>
                </div>
                <h3 className="mt-3 truncate text-sm font-bold">{food.name}</h3>
                <p className="mt-1 text-sm font-extrabold text-primary">
                  {formatPrice(food.price)}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="text-accent">
                    ★ <b className="text-navy">{food.rating}</b> ({food.reviews}{" "}
                    Ulasan)
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
          ))}
        </div>
      </section>
    </>
  );
}
