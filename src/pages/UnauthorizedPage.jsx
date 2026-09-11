import { Link } from "react-router";
import { ROUTES } from "@/constants";

export default function UnauthorizedPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-24">
      <p className="text-base font-bold uppercase tracking-[0.25em] text-accent">
        Restricted area
      </p>
      <h1 className="mt-4 text-4xl font-black">You do not have access here.</h1>
      <Link
        to={ROUTES.FOODS}
        className="mt-8 inline-block bg-primary px-5 py-3 font-bold text-white"
      >
        Return home
      </Link>
    </section>
  );
}
