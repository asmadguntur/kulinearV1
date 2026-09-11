import { Navigate, Outlet, useLocation } from "react-router";

import { ROLES, ROUTES } from "@/constants";
import { authStorage } from "@/lib/authStorage";

export function ProtectedRoute() {
  const location = useLocation();
  if (!authStorage.getToken())
    return (
      <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />
    );
  return <Outlet />;
}

export function AdminRoute() {
  const user = authStorage.getUser();
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user.role !== ROLES.ADMIN)
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  return <Outlet />;
}
