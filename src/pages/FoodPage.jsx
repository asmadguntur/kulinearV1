import FoodList from "@/components/FoodList";
import { useFoods } from "@/hooks/useFoods";

export default function FoodPage() {
  const { foods, loading, error, refetch } = useFoods();
  return (
    <section className="mx-auto max-w-7xl px-5 py-14">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
            The menu
          </p>
          <h1 className="mt-3 text-5xl font-black text-navy">Explore foods</h1>
        </div>
        <button
          onClick={refetch}
          className="border border-slate-300 px-4 py-2 text-sm font-bold"
        >
          Refresh list
        </button>
      </div>
      {loading && <p className="text-slate-500">Loading foods...</p>}
      {error && (
        <div className="border border-red-200 bg-red-50 p-5 text-red-700">
          Failed to load foods. Check `VITE_API_URL` and API access.
        </div>
      )}
      {!loading && !error && <FoodList foods={foods} />}
    </section>
  );
}
