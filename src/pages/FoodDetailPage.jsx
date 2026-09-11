import { Link, useParams } from "react-router";
import { ROUTES } from "@/constants";
import { useFoodDetail } from "@/hooks/useFoods";
import { FALLBACK_FOOD_IMAGE, getDemoFood } from "@/data/demoFoods";
import { formatPrice } from "@/lib/format";

export default function FoodDetailPage() {
  const { foodId } = useParams();
  const { food, loading } = useFoodDetail(foodId);
  // Data contoh dipakai sebagai cadangan kalau API belum/gagal mengirim detail.
  const fallback = getDemoFood(foodId);
  const visualFood = {
    name: fallback.name,
    price: fallback.price,
    rating: fallback.rating,
    description: fallback.description,
    imageUrl: fallback.image,
    totalLikes: fallback.reviews,
    ...(food || {}),
  };
  if (loading)
    return (
      <section className="mx-auto max-w-7xl px-5 py-14 text-slate-500">
        Loading food detail...
      </section>
    );
  return (
    <section className="mx-auto max-w-[1110px] px-5 py-8">
      <Link
        to={ROUTES.FOODS}
        className="text-base font-semibold text-slate-500"
      >
        Explore Foods <span className="mx-2">/</span>
        <span className="text-navy"> {visualFood.name}</span>
      </Link>
      <div className="mt-7 grid gap-8 lg:grid-cols-[1.35fr_0.95fr]">
        <div>
          <img
            src={visualFood.imageUrl || FALLBACK_FOOD_IMAGE}
            alt={visualFood.name}
            onError={(event) => {
              event.currentTarget.src = FALLBACK_FOOD_IMAGE;
            }}
            className="h-[280px] w-full rounded-xl object-cover md:h-[420px]"
          />
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold">Rating & Ulasan</h2>
              <button className="rounded bg-orange-50 px-4 py-2 text-base font-bold text-accent">
                Tulis Ulasan
              </button>
            </div>
            <div className="mt-5 flex items-center gap-5">
              <strong className="text-4xl">{visualFood.rating}</strong>
              <span className="text-base text-slate-500">
                ★ dari 5.0
                <br />
                98% pelanggan sangat puas
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <span className="rounded bg-orange-50 px-2 py-1 text-base font-bold text-accent">
            Makanan Utama
          </span>
          <div className="mt-3 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-extrabold leading-tight">
              {visualFood.name}
            </h1>
            <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-50 text-base text-accent">
              ♡
            </button>
          </div>
          <p className="mt-3 text-base text-accent">
            ★ <b className="text-navy">{visualFood.rating}</b>{" "}
            <span className="text-slate-500">
              ({visualFood.totalLikes} Ulasan)
            </span>
          </p>
          <div className="my-5 border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-extrabold text-primary">
                {formatPrice(visualFood.price)}
              </p>
              <div className="flex items-center gap-4 rounded border border-slate-100 px-3 py-2 text-base">
                <button>-</button>
                <b>1</b>
                <button>+</button>
              </div>
            </div>
          </div>
          <p className="border-t border-slate-200 pt-5 text-base leading-6 text-slate-500">
            {visualFood.description ||
              "Nikmati hidangan pilihan dengan cita rasa khas KULINEAR."}
          </p>
          <button className="mt-6 w-full rounded-lg bg-primary py-3 text-base font-bold text-white">
            🛒　Tambah ke Keranjang
          </button>
          <button className="mt-3 w-full rounded-lg border border-slate-200 py-3 text-base font-bold text-navy">
            ♡　Simpan ke Favorit
          </button>
        </div>
      </div>
    </section>
  );
}
