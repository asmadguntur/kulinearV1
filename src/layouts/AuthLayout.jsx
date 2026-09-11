import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <main className="min-h-screen bg-[#f8fbff]">
      <Outlet />
    </main>
  );
}
