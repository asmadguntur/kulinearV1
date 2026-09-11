import FoodCard from "./FoodCard";

export default function FoodList({ foods }) {
  if (!foods.length)
    return (
      <p className="border border-dashed border-slate-300 p-8 text-slate-500">
        No foods were returned by the API.
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
