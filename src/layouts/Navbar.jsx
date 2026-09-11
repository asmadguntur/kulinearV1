import { Link, NavLink, useNavigate } from "react-router";

import { ROUTES } from "@/constants";
import { authStorage } from "@/lib/authStorage";

const navItems = [
  ["Jelajahi Makanan", ROUTES.FOODS],
  ["Pesanan Saya", ROUTES.TRANSACTIONS],
];

export default function Navbar() {
  const navigate = useNavigate();
  const isSignedIn = Boolean(authStorage.getToken());

  const logout = () => {
    authStorage.clear();
    navigate(ROUTES.LANDING);
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1110px] items-center gap-5 px-5 py-4">
        <Link
          to={isSignedIn ? ROUTES.FOODS : ROUTES.LANDING}
          className="flex items-center gap-2 text-base font-extrabold text-primary"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-base text-white">
            ♜
          </span>
          KULINEAR
        </Link>
        {isSignedIn && (
          <nav className="mx-auto hidden items-center gap-8 text-base font-semibold md:flex">
            {navItems.map(([label, to]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  isActive
                    ? "text-primary"
                    : "text-slate-500 hover:text-primary"
                }
              >
                {label}
              </NavLink>
            ))}
            <span className="text-slate-500">Promo</span>
          </nav>
        )}
        {isSignedIn ? (
          <div className="ml-auto flex items-center gap-4">
            <Link
              to={ROUTES.CART}
              className="text-base text-navy"
              aria-label="Cart"
            >
              🛒
              <sup className="ml-0.5 rounded-full bg-accent px-1 text-base text-white">
                3
              </sup>
            </Link>
            <span className="hidden h-6 w-px bg-slate-200 sm:block" />
            <button
              onClick={logout}
              className="hidden text-base font-semibold text-slate-600 hover:text-primary sm:block"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="ml-auto flex gap-3">
            <Link
              to={ROUTES.LOGIN}
              className="px-3 py-2 text-base text-slate-600"
            >
              Masuk
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="rounded-md bg-primary px-4 py-2 text-base font-bold text-white"
            >
              Daftar
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
