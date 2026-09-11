import { NavLink, Outlet } from "react-router";

import { ROUTES } from "@/constants";

const adminNavItems = [
  ["Dashboard", ROUTES.ADMIN],
  ["Foods", ROUTES.ADMIN_FOODS],
  ["Users", ROUTES.ADMIN_USERS],
  ["Transactions", ROUTES.ADMIN_TRANSACTIONS],
];

export default function AdminLayout() {
  return (
    <div className="grid min-h-[calc(100vh-76px)] md:grid-cols-[220px_1fr]">
      <aside className="border-b border-slate-200 bg-white p-5 md:border-b-0 md:border-r">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Admin console
        </p>
        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {adminNavItems.map(([label, to]) => (
            <NavLink
              key={to}
              to={to}
              end={to === ROUTES.ADMIN}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-2 text-sm ${isActive ? "bg-primary text-white" : "text-slate-600 hover:bg-blue-50"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="p-6 md:p-10">
        <Outlet />
      </section>
    </div>
  );
}
