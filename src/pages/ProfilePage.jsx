import { useState } from "react";

import { getErrorMessage } from "@/api/client";
import { updateProfile } from "@/api/users";
import { useCurrentUser } from "@/hooks/useUsers";
import { authStorage } from "@/lib/authStorage";

const inputClass =
  "mt-2 w-full border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-primary";

function ProfileForm({ initialUser }) {
  const [form, setForm] = useState({
    name: initialUser.name || "",
    email: initialUser.email || "",
    phoneNumber: initialUser.phoneNumber || "",
    profilePictureUrl: initialUser.profilePictureUrl || "",
  });
  const [imageError, setImageError] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: "" });
  const [notice, setNotice] = useState("");

  const update = (event) => {
    const { name, value } = event.target;
    // URL baru harus dicoba lagi, jadi hapus penanda gagal dari URL sebelumnya.
    if (name === "profilePictureUrl") setImageError(false);
    setForm({ ...form, [name]: value });
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: "" });
    setNotice("");

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      profilePictureUrl: form.profilePictureUrl.trim(),
    };

    try {
      await updateProfile(payload);
      // Navbar dan RouteGuard membaca localStorage, bukan API. Tanpa baris ini
      // data di layar tetap yang lama sampai login ulang. Sebarkan initialUser
      // lebih dulu supaya role dan id tidak ikut hilang.
      authStorage.setUser({ ...initialUser, ...payload });
      setStatus({ loading: false, error: "" });
      setNotice("Profil berhasil diperbarui.");
    } catch (error) {
      setStatus({ loading: false, error: getErrorMessage(error) });
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mt-6 max-w-3xl border border-slate-200 bg-white p-6 shadow-[6px_6px_0_#2e6dfa]"
    >
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-blue-50 text-xl font-bold text-primary">
          {form.profilePictureUrl && !imageError ? (
            <img
              src={form.profilePictureUrl}
              alt=""
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
              className="h-full w-full object-cover"
            />
          ) : (
            (form.name || "?").charAt(0).toUpperCase()
          )}
        </span>
        <div>
          <p className="font-semibold">{form.name || "-"}</p>
          <p className="text-base text-slate-500">
            Role:{" "}
            <span className="font-bold text-primary">
              {initialUser.role || "-"}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block text-base font-bold">
          Nama
          <input
            required
            name="name"
            value={form.name}
            onChange={update}
            className={inputClass}
          />
        </label>
        <label className="block text-base font-bold">
          Email
          <input
            required
            type="email"
            name="email"
            value={form.email}
            onChange={update}
            className={inputClass}
          />
        </label>
        <label className="block text-base font-bold">
          No. HP
          <input
            type="tel"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={update}
            className={inputClass}
          />
        </label>
        <label className="block text-base font-bold">
          URL foto profil
          <input
            type="url"
            name="profilePictureUrl"
            value={form.profilePictureUrl}
            onChange={update}
            placeholder="https://..."
            className={inputClass}
          />
        </label>
      </div>

      {imageError && (
        <p className="mt-4 border border-amber-200 bg-amber-50 p-3 text-base text-amber-800">
          URL foto profil tidak bisa dimuat. Periksa kembali alamatnya.
        </p>
      )}

      {status.error && (
        <p className="mt-4 bg-red-50 p-3 text-base text-red-700">
          {status.error}
        </p>
      )}

      {notice && (
        <p className="mt-4 bg-green-50 p-3 text-base text-green-700">
          {notice}
        </p>
      )}

      <div className="mt-5">
        <button
          disabled={status.loading}
          className="bg-primary px-5 py-2 font-bold text-white disabled:opacity-60"
        >
          {status.loading ? "Menyimpan..." : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const { user, loading, error } = useCurrentUser();

  return (
    <section className="mx-auto max-w-[1110px] px-5 py-7 md:py-10">
      <p className="text-base font-bold uppercase tracking-[0.2em] text-accent">
        Akun saya
      </p>
      <h1 className="mt-2 text-3xl font-black text-navy">Profil</h1>

      {loading && <p className="mt-6 text-slate-500">Memuat profil...</p>}

      {error && (
        <div className="mt-6 border border-red-200 bg-red-50 p-5 text-red-700">
          Gagal memuat profil: {getErrorMessage(error)}
        </div>
      )}

      {!loading && !error && !user && (
        <p className="mt-6 text-slate-500">Data profil tidak ditemukan.</p>
      )}

      {user && <ProfileForm key={user.id} initialUser={user} />}
    </section>
  );
}
