export default function PlaceholderPage({ title }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-14">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
        KULINEAR
      </p>
      <h1 className="mt-3 text-4xl font-black text-navy">{title}</h1>
      <p className="mt-4 max-w-xl text-slate-600">
        This route is ready. Its API feature will be connected in the next
        implementation phase.
      </p>
    </section>
  );
}
