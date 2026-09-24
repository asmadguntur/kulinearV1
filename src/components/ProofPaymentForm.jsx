import { useState } from "react";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

const tabClass = (active) =>
  `rounded-lg px-3 py-2 text-base font-bold ${
    active ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
  }`;

export default function ProofPaymentForm({ busy, onUpload, onSaveUrl }) {
  const [mode, setMode] = useState("file"); // "file" | "link"
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Simpan elemen form sekarang. Setelah await, event.currentTarget
    // sudah bernilai null.
    const form = event.currentTarget;
    setLocalError("");

    if (mode === "file") {
      if (!file) return setLocalError("Pilih file gambar dulu.");
      if (!file.type.startsWith("image/"))
        return setLocalError("File harus berupa gambar.");
      if (file.size > MAX_SIZE)
        return setLocalError("Ukuran gambar maksimal 2 MB.");

      const saved = await onUpload(file);
      if (saved) {
        setFile(null);
        form.reset(); // kosongkan <input type="file">
      }
      return;
    }

    const saved = await onSaveUrl(url);
    if (saved) setUrl("");
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setLocalError("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => switchMode("file")}
          className={tabClass(mode === "file")}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => switchMode("link")}
          className={tabClass(mode === "link")}
        >
          Tempel Link
        </button>
      </div>

      {mode === "file" ? (
        <input
          type="file"
          accept="image/*"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="mt-4 block w-full text-base text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:font-bold file:text-accent"
        />
      ) : (
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://contoh.com/bukti-transfer.jpg"
          className="mt-4 w-full rounded-lg border border-slate-200 p-3 text-base outline-none focus:border-primary"
        />
      )}

      <p className="mt-2 text-xs text-slate-400">
        {mode === "file"
          ? "Format gambar, maksimal 2 MB. Kalau upload gagal, pakai Tempel Link."
          : "Link gambar yang bisa dibuka publik."}
      </p>

      <button
        type="submit"
        disabled={busy}
        className="mt-4 w-full rounded-lg bg-primary py-3 text-base font-bold text-white disabled:opacity-50"
      >
        {busy ? "Mengirim..." : "Kirim Bukti"}
      </button>

      {localError && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-base text-red-700">
          {localError}
        </p>
      )}
    </form>
  );
}
