import { useState } from "react";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

const tabClass = (active) =>
  `rounded-lg px-3 py-2 text-sm font-bold ${
    active ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
  }`;

// Form konfirmasi pembayaran: kirim bukti transfer lewat link ATAU file.
// Tidak tahu apa pun soal store: onSaveUrl(url) dan onUpload(file)
// mengembalikan true/false (dari saveProofUrl & uploadProof di store).
export default function ProofPaymentForm({
  busy,
  proofUrl,
  onSaveUrl,
  onUpload,
}) {
  const [mode, setMode] = useState("link"); // "link" | "file"
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState("");

  // Tombol baru aktif kalau isian untuk mode yang dipilih sudah ada.
  const ready = mode === "link" ? url.trim() !== "" : file !== null;

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
    <form onSubmit={handleSubmit} className="py-5">
      {proofUrl && (
        <p className="mb-3 rounded-lg bg-emerald-50 p-3 text-base text-emerald-700">
          Bukti transfer sudah terkirim.{" "}
          <a
            href={proofUrl}
            target="_blank"
            rel="noreferrer"
            className="font-bold underline"
          >
            Lihat bukti ↗
          </a>
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-base font-bold text-navy">
          {proofUrl
            ? "Salah kirim? Kirim ulang bukti transfer"
            : "Sudah bayar? Kirim bukti transfer"}
        </p>
        <div className="flex gap-2" role="group" aria-label="Cara kirim bukti">
          <button
            type="button"
            onClick={() => switchMode("link")}
            aria-pressed={mode === "link"}
            className={tabClass(mode === "link")}
          >
            Tempel Link
          </button>
          <button
            type="button"
            onClick={() => switchMode("file")}
            aria-pressed={mode === "file"}
            className={tabClass(mode === "file")}
          >
            Upload File
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        {mode === "link" ? (
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://contoh.com/bukti-transfer.jpg"
            aria-label="Tautan bukti transfer"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-3 text-base outline-none focus:border-primary"
          />
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            aria-label="File bukti transfer"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:font-bold file:text-accent"
          />
        )}
        <button
          type="submit"
          disabled={busy || !ready}
          className="rounded-lg bg-primary px-6 py-3 text-base font-bold text-white disabled:opacity-50"
        >
          {busy ? "Mengirim..." : "Konfirmasi Bayar"}
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-400">
        {mode === "link"
          ? "Tautan gambar yang bisa dibuka publik, diawali http:// atau https://."
          : "Format gambar, maksimal 2 MB. Kalau upload gagal, pakai Tempel Link."}
      </p>

      {localError && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-base text-red-700">
          {localError}
        </p>
      )}
    </form>
  );
}
