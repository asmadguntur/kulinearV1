import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ROLES, ROUTES } from "@/constants";
import { authStorage } from "@/lib/authStorage";
import { loginUser, registerUser } from "@/api/auth";
import { getErrorMessage } from "@/api/client";
import { useCartStore } from "@/store/cartStore";
import { useRatingStore } from "@/store/ratingStore";
import { useAdminTransactionStore } from "@/store/adminTransactionStore";
import { useTransactionStore } from "@/store/transactionStore";
import { usePaymentMethodStore } from "@/store/paymentMethodStore";

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const location = useLocation();
  // Dikirim oleh halaman register setelah akun berhasil dibuat.
  const justRegistered = isLogin && location.state?.registered;
  const [form, setForm] = useState(
    isLogin
      ? { email: location.state?.email || "", password: "" }
      : { name: "", email: "", password: "", passwordRepeat: "" },
  );
  const [status, setStatus] = useState({ loading: false, error: "" });

  const update = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    if (!isLogin && form.password !== form.passwordRepeat) {
      setStatus({ loading: false, error: "Passwords do not match." });
      return;
    }
    setStatus({ loading: true, error: "" });
    try {
      if (!isLogin) {
        // API mewajibkan field role. Akun dari form publik selalu "user".
        await registerUser({ ...form, role: ROLES.USER });
        navigate(ROUTES.LOGIN, {
          replace: true,
          state: { registered: true, email: form.email },
        });
        return;
      }
      const response = await loginUser(form);
      if (response?.token) {
        authStorage.setToken(response.token);
        if (response.user) authStorage.setUser(response.user);
        useCartStore.getState().reset(); // reset cart store saat login/logout
        useRatingStore.getState().reset(); // reset rating store saat login/logout
        useTransactionStore.getState().reset(); // reset transaction store saat login/logout
        useAdminTransactionStore.getState().reset(); // reset admin transaction store saat login/logout
        usePaymentMethodStore.getState().reset();
        // Jika user login dari halaman register, redirect ke halaman asal.
        // Jika user login dari halaman lain, redirect ke home page sesuai role.
        const isAdmin = response.user?.role === ROLES.ADMIN;
        const homePage = isAdmin ? ROUTES.ADMIN : ROUTES.FOODS;
        navigate(location.state?.from || homePage, { replace: true });
      } else {
        setStatus({
          loading: false,
          error:
            "Login succeeded but the API response did not include a token field.",
        });
      }
    } catch (error) {
      setStatus({ loading: false, error: getErrorMessage(error) });
    }
  };

  return (
    <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-5 py-12 md:grid-cols-2">
      <div>
        <Link to={ROUTES.LANDING} className="text-base font-black text-primary">
          KULINEAR<span className="text-accent">.</span>
        </Link>
        <p className="mt-16 text-base font-bold uppercase tracking-[0.25em] text-accent">
          {isLogin ? "Welcome back" : "Make yourself at home"}
        </p>
        <h1 className="mt-4 text-5xl font-black leading-none text-navy">
          {isLogin ? "Return to your table." : "Your next favorite is waiting."}
        </h1>
        <p className="mt-6 max-w-md text-base leading-8 text-slate-600">
          {isLogin
            ? "Pick up your food story where you left it."
            : "Create an account to save dishes, manage your basket, and keep your discoveries close."}
        </p>
      </div>
      <form
        onSubmit={submit}
        className="border border-slate-200 bg-white p-7 shadow-[8px_8px_0_#2e6dfa]"
      >
        {justRegistered && !status.error && (
          <p className="mb-4 bg-green-50 p-3 text-base text-green-700">
            Account created. Log in with your new account.
          </p>
        )}
        {!isLogin && (
          <label className="mb-4 block text-base font-bold">
            Name
            <input
              required
              name="name"
              value={form.name}
              onChange={update}
              className="mt-2 w-full border border-slate-300 px-3 py-3 font-normal outline-none focus:border-primary"
            />
          </label>
        )}
        <label className="mb-4 block text-base font-bold">
          Email
          <input
            required
            type="email"
            name="email"
            value={form.email}
            onChange={update}
            className="mt-2 w-full border border-slate-300 px-3 py-3 font-normal outline-none focus:border-primary"
          />
        </label>
        <label className="mb-4 block text-base font-bold">
          Password
          <input
            required
            type="password"
            name="password"
            minLength={isLogin ? undefined : 6}
            value={form.password}
            onChange={update}
            className="mt-2 w-full border border-slate-300 px-3 py-3 font-normal outline-none focus:border-primary"
          />
        </label>
        {!isLogin && (
          <label className="mb-4 block text-base font-bold">
            Repeat password
            <input
              required
              type="password"
              name="passwordRepeat"
              minLength={6}
              value={form.passwordRepeat}
              onChange={update}
              className="mt-2 w-full border border-slate-300 px-3 py-3 font-normal outline-none focus:border-primary"
            />
          </label>
        )}
        {status.error && (
          <p className="mb-4 bg-red-50 p-3 text-base text-red-700">
            {status.error}
          </p>
        )}
        <button
          disabled={status.loading}
          className="w-full bg-primary px-4 py-3 font-bold text-white disabled:opacity-60"
        >
          {status.loading
            ? "Please wait..."
            : isLogin
              ? "Log in"
              : "Create account"}
        </button>
        <p className="mt-5 text-center text-base text-slate-500">
          {isLogin ? "New here?" : "Already have an account?"}{" "}
          <Link
            to={isLogin ? ROUTES.REGISTER : ROUTES.LOGIN}
            className="font-bold text-primary"
          >
            {isLogin ? "Create an account" : "Log in"}
          </Link>
        </p>
        <div className="mt-5 text-center text-sm text-slate-400">
          <p>user: user@mail.com / 123123</p>
          <p>admin: admin@mail.com / 123123</p>
        </div>
      </form>
    </section>
  );
}
