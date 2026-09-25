import { useState } from "react";
import { Link, useParams } from "react-router";

import { getErrorMessage } from "@/api/client";
import ProofPaymentForm from "@/components/ProofPaymentForm";
import TransactionStatusBadge from "@/components/TransactionStatusBadge";
import { ROUTES } from "@/constants";
import { useCountdown } from "@/hooks/useCountdown";
import { useMyTransactions } from "@/hooks/useTransactions";
import { formatDateTimeWIB, formatPrice } from "@/lib/format";
import {
  getItemsTotal,
  getStatusKey,
  isExpired,
  isPending,
} from "@/lib/transaction";

// ---------------------------------------------------------------------------
// Teks & ikon hero per status. "review" bukan status dari API: artinya
// masih pending tapi user sudah mengirim bukti.
// ---------------------------------------------------------------------------
const HERO = {
  pending: {
    icon: "shield",
    tone: "bg-blue-50 text-primary",
    title: "Satu Langkah Lagi Menuju Hidangan Lezat!",
    text: "Selesaikan pembayaran sebelum batas waktu agar pesanan Anda langsung diproses koki.",
  },
  review: {
    icon: "clock",
    tone: "bg-blue-50 text-primary",
    title: "Bukti Pembayaran Terkirim",
    text: "Admin sedang memeriksa pembayaran Anda. Status pesanan berubah setelah diverifikasi.",
  },
  expired: {
    icon: "clock",
    tone: "bg-slate-100 text-slate-500",
    title: "Batas Waktu Pembayaran Habis",
    text: "Pesanan ini tidak bisa dibayar lagi. Batalkan, lalu buat pesanan baru.",
  },
  success: {
    icon: "check",
    tone: "bg-emerald-50 text-emerald-600",
    title: "Pembayaran Berhasil!",
    text: "Terima kasih! Pesanan Anda sedang disiapkan koki.",
  },
  failed: {
    icon: "cross",
    tone: "bg-red-50 text-red-600",
    title: "Pembayaran Ditolak",
    text: "Bukti pembayaran tidak dapat diverifikasi. Silakan buat pesanan baru.",
  },
  cancelled: {
    icon: "cross",
    tone: "bg-slate-100 text-slate-500",
    title: "Pesanan Dibatalkan",
    text: "Pesanan ini sudah dibatalkan dan tidak akan diproses.",
  },
};

function getHeroKey(transaction) {
  const key = getStatusKey(transaction); // pending | expired | success | ...
  if (key === "pending" && transaction.proofPaymentUrl) return "review";
  return key;
}

const PAYMENT_STEPS = [
  "Buka aplikasi m-banking atau internet banking Anda.",
  "Pilih menu Transfer > Virtual Account.",
  "Masukkan nomor virtual account di atas dan lakukan pembayaran.",
];

// ---------------------------------------------------------------------------
// Komponen kecil, hanya dipakai di halaman ini.
// ---------------------------------------------------------------------------
const ICON_PATHS = {
  shield: [
    "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z",
    "M9 12l2 2 4-4",
  ],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7v5l3 2"],
  check: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M8 12l3 3 5-6"],
  cross: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M9 9l6 6M15 9l-6 6"],
  copy: ["M9 9h11v11H9z", "M5 15V5a1 1 0 0 1 1-1h10"],
};

function Icon({ name, className = "h-6 w-6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICON_PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-bold text-navy">{value}</dd>
    </div>
  );
}

// Banyak imageUrl dari API bukan file gambar (mis. halaman Wikipedia),
// jadi siapkan cadangan saat gambar gagal dimuat.
function ItemImage({ item }) {
  const [broken, setBroken] = useState(false);

  if (broken || !item.imageUrl)
    return (
      <span
        aria-hidden="true"
        className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-orange-50 text-2xl"
      >
        🍽️
      </span>
    );

  return (
    <img
      src={item.imageUrl}
      alt={item.name}
      onError={() => setBroken(true)}
      className="h-14 w-14 shrink-0 rounded-lg object-cover"
    />
  );
}

// ---------------------------------------------------------------------------
// Halaman utama
// ---------------------------------------------------------------------------
export default function TransactionDetailPage() {
  const { transactionId } = useParams();
  const {
    transactions,
    loading,
    error,
    actionError,
    isPending: isBusy,
    cancel,
    saveProofUrl,
    uploadProof,
  } = useMyTransactions();
  const [copied, setCopied] = useState(false);

  // Hanya mencari di daftar milik user sendiri (dari store).
  const transaction = transactions.find((item) => item.id === transactionId);

  // Hook WAJIB dipanggil sebelum return awal di bawah. Aturan hooks: urutan
  // pemanggilan hook harus sama di setiap render. Makanya memakai ?.
  const countdown = useCountdown(transaction?.expiredDate);

  if (loading)
    return (
      <section className="mx-auto max-w-180 px-5 py-14 text-slate-500">
        Memuat pesanan...
      </section>
    );

  if (error)
    return (
      <section className="mx-auto max-w-180 px-5 py-14">
        <p className="rounded-lg bg-red-50 p-3 text-base text-red-700">
          Gagal memuat pesanan: {getErrorMessage(error)}
        </p>
      </section>
    );

  if (!transaction)
    return (
      <section className="mx-auto max-w-180 px-5 py-14 text-center">
        <h1 className="text-2xl font-extrabold">Transaksi tidak ditemukan</h1>
        <Link
          to={ROUTES.TRANSACTIONS}
          className="mt-4 inline-block font-bold text-primary"
        >
          ← Kembali ke Pesanan Saya
        </Link>
      </section>
    );

  const method = transaction.payment_method || {};
  const items = transaction.transaction_items || [];
  const itemsTotal = getItemsTotal(transaction);
  const pending = isPending(transaction);
  const expired = isExpired(transaction);
  const canPay = pending && !expired; // boleh bayar & kirim bukti
  // Tombol Selesai terkunci selama masih bisa dibayar tapi belum ada bukti.
  // proofPaymentUrl berasal dari store, jadi otomatis terbuka setelah
  // saveProofUrl/uploadProof berhasil dan store mengambil ulang data.
  const needsProof = canPay && !transaction.proofPaymentUrl;
  const busy = isBusy(transaction.id);
  const hero = HERO[getHeroKey(transaction)] || HERO.pending;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(method.virtualAccountNumber || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard bisa ditolak browser (mis. bukan https). Abaikan saja.
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Batalkan pesanan ini? Aksi ini tidak bisa diulang."))
      return;
    await cancel(transaction.id);
  };

  return (
    <section className="mx-auto max-w-180 px-5 py-10">
      {/* ① Hero */}
      <div className="text-center">
        <span
          className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${hero.tone}`}
        >
          <Icon name={hero.icon} />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-navy sm:text-3xl">
          {hero.title}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-base text-slate-500">
          {hero.text}
        </p>
      </div>

      {/* ② Hitung mundur: hanya selama masih bisa dibayar */}
      {canPay && (
        <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-sm text-slate-500">Batas Waktu Pembayaran</p>
            <p className="mt-1 text-base font-bold text-navy">
              Berakhir {formatDateTimeWIB(transaction.expiredDate)}
            </p>
          </div>
          <span
            role="timer"
            aria-label={`Sisa waktu ${countdown.text}`}
            className="shrink-0 rounded-lg bg-accent px-4 py-2 font-mono text-white text-xl font-bold tabular-nums"
          >
            {countdown.text}
          </span>
        </div>
      )}

      {/* ③ Detail transaksi */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <h2 className="break-all text-lg font-extrabold text-navy">
            Detail Transaksi #{transaction.invoiceId}
          </h2>
          <TransactionStatusBadge
            transaction={transaction}
            className="uppercase tracking-wide"
          />
        </div>

        <dl className="space-y-3 border-b border-slate-100 py-5 text-base">
          <DetailRow label="Metode Pembayaran" value={method.name || "-"} />
          <DetailRow
            label="Waktu Pemesanan"
            value={formatDateTimeWIB(transaction.orderDate)}
          />
          <DetailRow
            label="Atas Nama"
            value={method.virtualAccountName || "-"}
          />
        </dl>

        <ul className="divide-y divide-slate-100 border-b border-slate-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-4">
              <ItemImage item={item} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold text-navy">
                  {item.name}
                </p>
                <p className="text-sm text-slate-500">
                  {item.quantity} Porsi • {formatPrice(item.price)}
                </p>
              </div>
              <p className="text-base font-bold text-navy">
                {formatPrice(Number(item.price) * Number(item.quantity))}
              </p>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between pt-5">
          <span className="text-base font-extrabold text-navy">
            Total Pembayaran
          </span>
          <span className="text-xl font-extrabold text-primary">
            {formatPrice(transaction.totalAmount)}
          </span>
        </div>
        {itemsTotal !== transaction.totalAmount && (
          <p className="mt-2 text-right text-xs text-slate-400">
            Total harga item {formatPrice(itemsTotal)}. Tagihan dari server
            belum menghitung jumlah porsi (keterbatasan API).
          </p>
        )}
      </div>

      {/* ④ Kartu pembayaran: hanya untuk status pending */}
      {pending && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <h2 className="text-lg font-extrabold text-navy">
              {method.name} Virtual Account
            </h2>
            {method.imageUrl && (
              <img
                src={method.imageUrl}
                alt={method.name}
                className="h-6 w-16 object-contain"
              />
            )}
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 py-5">
            <div>
              <p className="text-sm text-slate-500">Nomor Virtual Account</p>
              <p className="mt-1 font-mono text-xl font-bold tracking-wide text-navy">
                {method.virtualAccountNumber || "-"}
              </p>
            </div>
            {canPay && method.virtualAccountNumber && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2 text-base font-bold text-accent"
              >
                <Icon name="copy" className="h-4 w-4" />
                {copied ? "Tersalin ✓" : "Salin No"}
              </button>
            )}
          </div>

          {canPay && (
            <>
              <div className="border-b border-slate-100 py-5">
                <h3 className="text-base font-extrabold text-navy">
                  Cara Pembayaran
                </h3>
                <ol className="mt-4 space-y-3">
                  {PAYMENT_STEPS.map((step, index) => (
                    <li
                      key={step}
                      className="flex items-start gap-3 text-base text-slate-600"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <ProofPaymentForm
                busy={busy}
                proofUrl={transaction.proofPaymentUrl}
                onSaveUrl={(url) => saveProofUrl(transaction.id, url)}
                onUpload={(file) => uploadProof(transaction.id, file)}
              />
            </>
          )}

          {actionError && (
            <p className="mb-3 rounded-lg bg-red-50 p-3 text-base text-red-700">
              {actionError}
            </p>
          )}

          <button
            type="button"
            onClick={handleCancel}
            disabled={busy}
            className={`w-full rounded-lg border border-red-200 py-3 text-base font-bold text-red-600 disabled:opacity-50 ${
              canPay ? "" : "mt-5"
            }`}
          >
            {busy ? "Memproses..." : "Batalkan Pembelian"}
          </button>
        </div>
      )}

      {/* Status final: cukup tampilkan tautan bukti kalau ada */}
      {!pending && transaction.proofPaymentUrl && (
        <p className="mt-6 text-center text-base text-slate-500">
          Bukti pembayaran:{" "}
          <a
            href={transaction.proofPaymentUrl}
            target="_blank"
            rel="noreferrer"
            className="font-bold text-primary"
          >
            Lihat ↗
          </a>
        </p>
      )}

      {/* ⑤ Navigasi. Selama pesanan masih bisa dibayar, tombol Selesai
          terkunci sampai bukti transfer (link atau file) terkirim. */}
      {needsProof ? (
        <>
          <button
            type="button"
            disabled
            aria-describedby="finish-hint"
            className="mt-6 block w-full cursor-not-allowed rounded-lg bg-accent py-4 text-center text-base font-bold text-white opacity-50"
          >
            Selesai & Kembali Berbelanja
          </button>
          <p id="finish-hint" className="mt-2 text-center text-sm text-slate-500">
            Kirim bukti transfer (link atau file) lewat tombol Konfirmasi Bayar
            untuk menyelesaikan pesanan.
          </p>
        </>
      ) : (
        <Link
          to={ROUTES.FOODS}
          className="mt-6 block rounded-lg bg-accent py-4 text-center text-base font-bold text-white"
        >
          Selesai & Kembali Berbelanja
        </Link>
      )}
      <Link
        to={ROUTES.TRANSACTIONS}
        className="mt-3 block text-center text-base font-semibold text-slate-500 hover:text-navy"
      >
        Lihat Semua Pesanan
      </Link>
    </section>
  );
}
