import { useMemo, useState } from "react";

import { registerUser } from "@/api/auth";
import { getErrorMessage } from "@/api/client";
import { updateUserRole } from "@/api/users";
import Pagination from "@/components/Pagination";
import { ROLES } from "@/constants";
import { useUsers } from "@/hooks/useUsers";
import { authStorage } from "@/lib/authStorage";

const PER_PAGE = 10;

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  passwordRepeat: "",
  phoneNumber: "",
  role: ROLES.USER,
};

const inputClass =
  "mt-2 w-full border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-primary";

function matchesKeyword(user, keyword) {
  return [user.name, user.email, user.phoneNumber, user.role].some((text) =>
    String(text || "")
      .toLowerCase()
      .includes(keyword),
  );
}

function CreateUserForm({ onCreated, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState({ loading: false, error: "" });

  const update = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    if (form.password !== form.passwordRepeat) {
      setStatus({
        loading: false,
        error: "Password dan ulangi password tidak sama.",
      });
      return;
    }
    setStatus({ loading: true, error: "" });
    try {
      // phoneNumber opsional, jadi jangan kirim string kosong ke API.
      const { phoneNumber, ...payload } = form;
      await registerUser(phoneNumber ? { ...payload, phoneNumber } : payload);
      onCreated(form.email);
    } catch (error) {
      setStatus({ loading: false, error: getErrorMessage(error) });
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mt-6 border border-slate-200 bg-white p-6 shadow-[6px_6px_0_#2e6dfa]"
    >
      <h2 className="text-lg font-extrabold">Tambah user</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
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
          Password
          <input
            required
            type="password"
            name="password"
            minLength={6}
            value={form.password}
            onChange={update}
            className={inputClass}
          />
        </label>
        <label className="block text-base font-bold">
          Ulangi password
          <input
            required
            type="password"
            name="passwordRepeat"
            minLength={6}
            value={form.passwordRepeat}
            onChange={update}
            className={inputClass}
          />
        </label>
        <label className="block text-base font-bold">
          No. HP <span className="font-normal text-slate-400">(opsional)</span>
          <input
            type="tel"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={update}
            className={inputClass}
          />
        </label>
        <label className="block text-base font-bold">
          Role
          <select
            name="role"
            value={form.role}
            onChange={update}
            className={inputClass}
          >
            {Object.values(ROLES).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
      </div>
      {status.error && (
        <p className="mt-4 bg-red-50 p-3 text-base text-red-700">
          {status.error}
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          disabled={status.loading}
          className="bg-primary px-5 py-2 font-bold text-white disabled:opacity-60"
        >
          {status.loading ? "Menyimpan..." : "Simpan user"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-slate-300 px-5 py-2 font-bold"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

export default function AdminUsersPage() {
  const { users, setUsers, loading, error, refetch } = useUsers();
  const currentUserId = authStorage.getUser()?.id;
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [savingId, setSavingId] = useState(null);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((user) => matchesKeyword(user, keyword));
  }, [users, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visibleUsers = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  const handleCreated = (email) => {
    setShowForm(false);
    setNotice({ type: "success", text: `User ${email} berhasil ditambahkan.` });
    refetch();
  };

  const changeRole = async (user, role) => {
    setSavingId(user.id);
    setNotice({ type: "", text: "" });
    try {
      await updateUserRole(user.id, role);
      // Perbarui baris ini saja, tidak perlu memuat ulang semua user.
      setUsers((list) =>
        list.map((item) => (item.id === user.id ? { ...item, role } : item)),
      );
      setNotice({
        type: "success",
        text: `Role ${user.name} diubah menjadi ${role}.`,
      });
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-base font-bold uppercase tracking-[0.2em] text-accent">
            Manage users
          </p>
          <h1 className="mt-2 text-3xl font-black text-navy">Daftar User</h1>
          {!loading && !error && (
            <p className="mt-1 text-base text-slate-500">
              {filtered.length} user
              {query && ` cocok dengan "${query.trim()}"`}
              {totalPages > 1 && ` · halaman ${currentPage} dari ${totalPages}`}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={refetch}
            className="border border-slate-300 bg-white px-4 py-2 font-bold"
          >
            Muat ulang
          </button>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary px-4 py-2 font-bold text-white"
            >
              + Tambah user
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <CreateUserForm
          onCreated={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {notice.text && (
        <p
          className={`mt-4 p-3 text-base ${
            notice.type === "error"
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {notice.text}
        </p>
      )}

      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setPage(1);
        }}
        placeholder="Cari nama, email, no. HP, atau role..."
        className="mt-6 w-full max-w-md border border-slate-300 bg-white px-4 py-2 outline-none focus:border-primary"
      />

      {loading && <p className="mt-6 text-slate-500">Memuat user...</p>}
      {error && (
        <div className="mt-6 border border-red-200 bg-red-50 p-5 text-red-700">
          Gagal memuat user: {getErrorMessage(error)}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mt-4 overflow-x-auto border border-slate-200 bg-white">
            <table className="w-full min-w-[860px] text-left text-base">
              <thead className="bg-slate-50 text-sm uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Password</th>
                  <th className="px-4 py-3">No. HP</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">ID</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Tidak ada user.
                    </td>
                  </tr>
                )}
                {visibleUsers.map((user) => {
                  const isSelf = user.id === currentUserId;

                  const roleOptions = [
                    ...new Set([...Object.values(ROLES), user.role]),
                  ].filter(Boolean);
                  return (
                    <tr key={user.id} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-blue-50 font-bold text-primary">
                            {user.profilePictureUrl ? (
                              <img
                                src={user.profilePictureUrl}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              (user.name || "?").charAt(0).toUpperCase()
                            )}
                          </span>
                          <span className="font-semibold">
                            {user.name || "-"}
                          </span>
                          {isSelf && (
                            <span className="bg-blue-50 px-2 py-0.5 text-sm font-bold text-primary">
                              Anda
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{user.email || "-"}</td>
                      <td className="px-4 py-3 font-mono text-sm text-slate-500">
                        {user.password || "-"}
                      </td>
                      <td className="px-4 py-3">{user.phoneNumber || "-"}</td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role || ""}
                          disabled={isSelf || savingId === user.id}
                          title={
                            isSelf
                              ? "Tidak bisa mengubah role akun sendiri"
                              : undefined
                          }
                          onChange={(event) =>
                            changeRole(user, event.target.value)
                          }
                          className="border border-slate-300 bg-white px-2 py-1 disabled:opacity-60"
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">
                        {user.id}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
