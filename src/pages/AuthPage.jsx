import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { ROUTES } from "@/constants";
import { authStorage } from "@/lib/authStorage";
import { loginUser, registerUser } from "@/api/auth";

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(
    isLogin
      ? { email: "", password: "" }
      : { name: "", email: "", password: "", passwordRepeat: "" },
  );
  const [status, setStatus] = useState({ loading: false, error: "" });

  const update = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: "" });
    try {
      const response = isLogin
        ? await loginUser(form)
        : await registerUser(form);
      const token = response?.token;
      if (!isLogin) {
        navigate(ROUTES.LOGIN, { replace: true });
      } else if (token) {
        authStorage.setToken(token);
        if (response.user) authStorage.setUser(response.user);
        navigate(location.state?.from || ROUTES.HOME, { replace: true });
      } else {
        setStatus({
          loading: false,
          error:
            "Login succeeded but the API response did not include a token field.",
        });
      }
    } catch (error) {
      setStatus({
        loading: false,
        error:
          error.response?.data?.message || error.message || "Request failed.",
      });
    }
  };

  return (
    <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-5 py-12 md:grid-cols-2">
      <div>
        <Link to={ROUTES.LANDING} className="text-xl font-black text-primary">
          KULINEAR<span className="text-accent">.</span>
        </Link>
        <p className="mt-16 text-xs font-bold uppercase tracking-[0.25em] text-accent">
          {isLogin ? "Welcome back" : "Make yourself at home"}
        </p>
        <h1 className="mt-4 text-5xl font-black leading-none text-navy">
          {isLogin ? "Return to your table." : "Your next favorite is waiting."}
        </h1>
        <p className="mt-6 max-w-md text-lg leading-8 text-slate-600">
          {isLogin
            ? "Pick up your food story where you left it."
            : "Create an account to save dishes, manage your basket, and keep your discoveries close."}
        </p>
      </div>
      <form
        onSubmit={submit}
        className="border border-slate-200 bg-white p-7 shadow-[8px_8px_0_#2e6dfa]"
      >
        {!isLogin && (
          <label className="mb-4 block text-sm font-bold">
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
        <label className="mb-4 block text-sm font-bold">
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
        <label className="mb-4 block text-sm font-bold">
          Password
          <input
            required
            type="password"
            name="password"
            value={form.password}
            onChange={update}
            className="mt-2 w-full border border-slate-300 px-3 py-3 font-normal outline-none focus:border-primary"
          />
        </label>
        {!isLogin && (
          <label className="mb-4 block text-sm font-bold">
            Repeat password
            <input
              required
              type="password"
              name="passwordRepeat"
              value={form.passwordRepeat}
              onChange={update}
              className="mt-2 w-full border border-slate-300 px-3 py-3 font-normal outline-none focus:border-primary"
            />
          </label>
        )}
        {status.error && (
          <p className="mb-4 bg-red-50 p-3 text-sm text-red-700">
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
        <p className="mt-5 text-center text-sm text-slate-500">
          {isLogin ? "New here?" : "Already have an account?"}{" "}
          <Link
            to={isLogin ? ROUTES.REGISTER : ROUTES.LOGIN}
            className="font-bold text-primary"
          >
            {isLogin ? "Create an account" : "Log in"}
          </Link>
        </p>
      </form>
    </section>
  );
}
