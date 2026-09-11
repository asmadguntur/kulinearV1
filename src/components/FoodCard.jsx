import { Link } from "react-router";

import { ROUTES } from "@/constants";
import { demoFoods } from "@/data/demoFoods";
import { formatPrice } from "@/lib/format";

export default function FoodCard({ food }) {
  const visualFood = { ...demoFoods[0], ...food };
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <img
        src={visualFood.image}
        alt={visualFood.name}
        className="h-40 w-full object-cover"
      />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="rounded bg-orange-50 px-2 py-1 text-[10px] font-bold text-accent">
            Populer
          </span>
          <span className="text-lg text-accent">♡</span>
        </div>
        <h2 className="mt-3 text-sm font-bold">
          {visualFood.name || "Unnamed food"}
        </h2>
        <p className="mt-1 text-sm font-extrabold text-primary">
          {formatPrice(visualFood.price || 0)}
        </p>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span className="text-accent">
            ★ <b className="text-navy">{visualFood.rating || "-"}</b> (
            {visualFood.reviews || 0} Ulasan)
          </span>
          <Link
            to={ROUTES.FOOD_DETAIL(visualFood.id)}
            className="rounded bg-primary px-3 py-1.5 font-bold text-white"
          >
            Pesan
          </Link>
        </div>
      </div>
    </article>
  );
}
