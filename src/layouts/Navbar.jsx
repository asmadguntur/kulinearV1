import { Link, NavLink, useNavigate } from "react-router";
import { ROLES, ROUTES } from "@/constants";
import { authStorage } from "@/lib/authStorage";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useCartStore } from "@/store/cartStore";

const navItems = [
  ["Jelajahi Makanan", ROUTES.FOODS],
  ["Pesanan Saya", ROUTES.TRANSACTIONS],
];

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isSignedIn = Boolean(authStorage.getToken());
  const user = authStorage.getUser();
  const isAdmin = user?.role === ROLES.ADMIN;
  const cart = useCart({ enabled: isSignedIn && !isAdmin });
  const items = isAdmin
    ? [...navItems, ["Admin Console", ROUTES.ADMIN]]
    : [...navItems, ["Favorit", ROUTES.FAVORITES]];

  const logout = () => {
    setMenuOpen(false);
    authStorage.clear();
    useCartStore.getState().reset();
    navigate(ROUTES.LANDING);
  };

  const linkClass = ({ isActive }) =>
    isActive ? "text-primary" : "text-slate-500 hover:text-primary";

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
            {items.map(([label, to]) => (
              <NavLink key={to} to={to} className={linkClass}>
                {label}
              </NavLink>
            ))}
          </nav>
        )}
        {isSignedIn ? (
          <div className="ml-auto flex items-center gap-4">
            {/* total quantity get from Zustand store, not from localStorage, so
            it will update automatically when user add/remove item in cart. */}
            <Link
              to={ROUTES.CART}
              className="text-base text-navy"
              aria-label="Cart"
            >
              🛒
              <sup className="ml-0.5 rounded-full bg-accent px-1 text-sm text-white">
                {cart.totalQuantity}
              </sup>
            </Link>
            <span className="hidden h-6 w-px bg-slate-200 md:block" />
            <NavLink
              to={ROUTES.PROFILE}
              className={linkClass + " flex items-center gap-2"}
            >
              {/* name and profile picture will update automatically when user
              update profile, because we use Zustand store to manage user
              state. */}
              <span className="hidden text-base font-semibold text-navy md:inline">
                Halo, {user?.name || "Profile"}
              </span>
              {/* picture */}
              {user?.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt="Profile"
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                (user?.name || "Profile").charAt(0).toUpperCase()
              )}
            </NavLink>
            <button
              onClick={logout}
              className="hidden text-base font-semibold text-slate-600 hover:text-primary md:block"
            >
              Keluar
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              className="grid h-9 w-9 place-items-center rounded-lg text-xl text-navy hover:bg-slate-100 md:hidden"
            >
              {menuOpen ? "✕" : "☰"}
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
      {isSignedIn && menuOpen && (
        <nav
          id="mobile-menu"
          className="border-t border-slate-200 px-5 py-3 md:hidden"
        >
          {items.map(([label, to]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={(state) =>
                `block py-3 text-base font-semibold ${linkClass(state)}`
              }
            >
              {label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={logout}
            className="mt-2 block w-full border-t border-slate-200 pt-4 pb-1 text-left text-base font-semibold text-slate-600 hover:text-primary"
          >
            Keluar
          </button>
        </nav>
      )}
    </header>
  );
}
