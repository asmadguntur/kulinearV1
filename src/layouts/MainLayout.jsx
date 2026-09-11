import { Outlet } from "react-router";

import Footer from "@/layouts/Footer";
import Navbar from "@/layouts/Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#f5f8fc] text-navy">
      <Navbar />
      <main className="min-h-[calc(100vh-150px)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
