import { createBrowserRouter } from "react-router";

import { ROUTES } from "@/constants";
import AdminLayout from "@/layouts/AdminLayout";
import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";
import { AdminRoute, ProtectedRoute } from "@/layouts/RouteGuard";
import AuthPage from "@/pages/AuthPage";
import CartPage from "@/pages/CartPage";
import FoodDetailPage from "@/pages/FoodDetailPage";
import FoodPage from "@/pages/FoodPage";
import HomePage from "@/pages/HomePage";
import LandingPage from "@/pages/LandingPage";
import NotFoundPage from "@/pages/NotFoundPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";

const placeholder = (title) => ({ element: <PlaceholderPage title={title} /> });

export const router = createBrowserRouter([
  {
    Component: AuthLayout,
    children: [
      { path: ROUTES.LOGIN, element: <AuthPage mode="login" /> },
      { path: ROUTES.REGISTER, element: <AuthPage mode="register" /> },
    ],
  },
  {
    Component: MainLayout,
    children: [
      { path: ROUTES.LANDING, Component: LandingPage },
      {
        Component: ProtectedRoute,
        children: [
          { path: ROUTES.HOME, Component: HomePage },
          { path: ROUTES.FOODS, Component: FoodPage },
          { path: "/foods/:foodId", Component: FoodDetailPage },
          { path: ROUTES.FAVORITES, ...placeholder("Favorites") },
          { path: ROUTES.CART, Component: CartPage },
          { path: ROUTES.CHECKOUT, Component: CartPage },
          { path: ROUTES.TRANSACTIONS, ...placeholder("Transactions") },
          {
            path: "/transactions/:transactionId",
            ...placeholder("Transaction detail"),
          },
          { path: ROUTES.PROFILE, ...placeholder("Profile") },
          {
            Component: AdminRoute,
            children: [
              {
                path: ROUTES.ADMIN,
                Component: AdminLayout,
                children: [
                  { index: true, ...placeholder("Admin dashboard") },
                  { path: "foods", ...placeholder("Manage foods") },
                  { path: "foods/create", ...placeholder("Create food") },
                  { path: "foods/:foodId/edit", ...placeholder("Edit food") },
                  { path: "users", ...placeholder("Manage users") },
                  {
                    path: "transactions",
                    ...placeholder("Manage transactions"),
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: ROUTES.UNAUTHORIZED, Component: UnauthorizedPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
