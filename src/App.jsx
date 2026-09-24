import { AdminRoute, ProtectedRoute, UserRoute } from "@/layouts/RouteGuard";
import { BrowserRouter, Route, Routes } from "react-router";
import { ROUTES } from "@/constants";

import AdminLayout from "@/layouts/AdminLayout";
import AdminFoodsPage from "@/pages/AdminFoodsPage";
import AdminFoodFormPage from "@/pages/AdminFoodFormPage";
import AdminTransactionsPage from "@/pages/AdminTransactionsPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import AuthLayout from "@/layouts/AuthLayout";
import AuthPage from "@/pages/AuthPage";
import CartPage from "@/pages/CartPage";
import FavoritesPage from "@/pages/FavoritesPage";
import FoodDetailPage from "@/pages/FoodDetailPage";
import FoodPage from "@/pages/FoodPage";
import LandingPage from "@/pages/LandingPage";
import MainLayout from "@/layouts/MainLayout";
import NotFoundPage from "@/pages/NotFoundPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import ProfilePage from "@/pages/ProfilePage";
import TransactionDetailPage from "@/pages/TransactionDetailPage";
import TransactionPage from "@/pages/TransactionPage";
import RatingPage from "@/pages/RatingPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
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
            <Route path="/foods/:foodId/rating" element={<RatingPage />} />
            {/* Khusus role user */}
            <Route element={<UserRoute />}>
              <Route path={ROUTES.FAVORITES} element={<FavoritesPage />} />
              <Route path={ROUTES.CART} element={<CartPage />} />
              <Route path={ROUTES.CHECKOUT} element={<CartPage />} />
              <Route path={ROUTES.TRANSACTIONS} element={<TransactionPage />} />
              <Route
                path="/transactions/:transactionId"
                element={<TransactionDetailPage />}
              />
            </Route>
            {/* <Route path={ROUTES.CART} element={<CartPage />} />
            <Route path={ROUTES.CHECKOUT} element={<CartPage />} /> */}
            <Route
              path={ROUTES.PROFILE}
              element={<ProfilePage />}
              key="profile"
            />

            {/* Butuh role admin */}
            <Route element={<AdminRoute />}>
              <Route path={ROUTES.ADMIN} element={<AdminLayout />}>
                <Route
                  index
                  element={<PlaceholderPage title="Admin dashboard" />}
                />
                <Route path="foods" element={<AdminFoodsPage />} />
                <Route
                  path="foods/create"
                  element={<AdminFoodFormPage mode="create" />}
                  key="create"
                />
                <Route
                  path="foods/:foodId/edit"
                  element={<AdminFoodFormPage mode="edit" />}
                  key="edit"
                />
                <Route path="users" element={<AdminUsersPage />} />
                <Route
                  path="transactions"
                  element={<AdminTransactionsPage />}
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
