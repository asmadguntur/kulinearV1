import { BrowserRouter, Route, Routes } from "react-router";

import { ROUTES } from "@/constants";
import AdminLayout from "@/layouts/AdminLayout";
import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";
import { AdminRoute, ProtectedRoute, UserRoute } from "@/layouts/RouteGuard";
import AdminUsersPage from "@/pages/AdminUsersPage";
import AuthPage from "@/pages/AuthPage";
import CartPage from "@/pages/CartPage";
import FavoritesPage from "@/pages/FavoritesPage";
import FoodDetailPage from "@/pages/FoodDetailPage";
import FoodPage from "@/pages/FoodPage";
import LandingPage from "@/pages/LandingPage";
import NotFoundPage from "@/pages/NotFoundPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman tanpa navbar: login & register.
            key berbeda supaya React membuat AuthPage baru saat pindah halaman,
            bukan memakai ulang state form yang lama. */}
        <Route element={<AuthLayout />}>
          <Route
            path={ROUTES.LOGIN}
            element={<AuthPage key="login" mode="login" />}
          />
          <Route
            path={ROUTES.REGISTER}
            element={<AuthPage key="register" mode="register" />}
          />
        </Route>

        {/* Halaman dengan navbar & footer */}
        <Route element={<MainLayout />}>
          <Route path={ROUTES.LANDING} element={<LandingPage />} />

          {/* Butuh token */}
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.FOODS} element={<FoodPage />} />
            <Route path="/foods/:foodId" element={<FoodDetailPage />} />
            {/* Khusus role user */}
            <Route element={<UserRoute />}>
              <Route path={ROUTES.FAVORITES} element={<FavoritesPage />} />
            </Route>
            <Route path={ROUTES.CART} element={<CartPage />} />
            <Route path={ROUTES.CHECKOUT} element={<CartPage />} />
            <Route
              path={ROUTES.TRANSACTIONS}
              element={<PlaceholderPage title="Transactions" />}
            />
            <Route
              path="/transactions/:transactionId"
              element={<PlaceholderPage title="Transaction detail" />}
            />
            <Route
              path={ROUTES.PROFILE}
              element={<PlaceholderPage title="Profile" />}
            />

            {/* Butuh role admin */}
            <Route element={<AdminRoute />}>
              <Route path={ROUTES.ADMIN} element={<AdminLayout />}>
                <Route
                  index
                  element={<PlaceholderPage title="Admin dashboard" />}
                />
                <Route
                  path="foods"
                  element={<PlaceholderPage title="Manage foods" />}
                />
                <Route
                  path="foods/create"
                  element={<PlaceholderPage title="Create food" />}
                />
                <Route
                  path="foods/:foodId/edit"
                  element={<PlaceholderPage title="Edit food" />}
                />
                <Route path="users" element={<AdminUsersPage />} />
                <Route
                  path="transactions"
                  element={<PlaceholderPage title="Manage transactions" />}
                />
              </Route>
            </Route>
          </Route>

          <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
