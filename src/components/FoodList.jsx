import FoodCard from "./FoodCard";

export default function FoodList({ foods }) {
  if (!foods.length)
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-8 text-base text-slate-500">
        Tidak ada menu yang cocok. Coba kata kunci lain atau ganti filter.
      </p>
    );
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {foods.map((food) => (
        <FoodCard key={food.id} food={food} />
      ))}
    </div>
  );
}
