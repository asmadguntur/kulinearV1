import { Link } from "react-router";
import { ROUTES } from "@/constants";

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-24">
      <p className="text-7xl font-black text-primary">404</p>
      <h1 className="mt-4 text-4xl font-bold">This plate is empty.</h1>
      <Link
        to={ROUTES.LANDING}
        className="mt-8 inline-block bg-primary px-5 py-3 font-bold text-white"
      >
        Back home
      </Link>
    </section>
  );
}
