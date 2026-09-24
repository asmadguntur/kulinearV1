import { useState } from "react";
import { Link, useParams } from "react-router";

import { getErrorMessage } from "@/api/client";
import ProofPaymentForm from "@/components/ProofPaymentForm";
import TransactionStatusBadge from "@/components/TransactionStatusbadge";
import { ROUTES } from "@/constants";
import { FALLBACK_FOOD_IMAGE } from "@/data/demoFoods";
import { useMyTransactions } from "@/hooks/useTransactions";
import { formatDateTime, formatPrice } from "@/lib/format";
import { getItemsTotal, isExpired, isPending } from "@/lib/transaction";

export default function TransactionDetailPage() {
  const { transactionId } = useParams();
  const {
    transactions,
    loading,
    error,
    actionError,
    isPending: isBusy,
    cancel,
    uploadProof,
    saveProofUrl,
  } = useMyTransactions();
  const [copied, setCopied] = useState(false);

  const transaction = transactions.find((item) => item.id === transactionId);

  if (loading)
    return (
      <section className="mx-auto max-w-7xl px-5 py-14 text-slate-500">
        Memuat pesanan...
      </section>
    );

  if (!transaction)
    return (
      <section className="mx-auto max-w-[1110px] px-5 py-14 text-center">
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
  const busy = isBusy(transaction.id);

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
    <section className="mx-auto max-w-[1110px] px-5 py-8">
      <Link
        to={ROUTES.TRANSACTIONS}
        className="text-base font-semibold text-slate-500"
      >
        Pesanan Saya <span className="mx-2">/</span>
        <span className="text-navy">{transaction.invoiceId}</span>
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">{transaction.invoiceId}</h1>
          <p className="text-base text-slate-500">
            Dipesan {formatDateTime(transaction.orderDate)}
          </p>
        </div>
        <TransactionStatusBadge transaction={transaction} />
      </div>

      {actionError && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-base text-red-700">
          {actionError}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Instruksi pembayaran */}
        <div className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-extrabold">Transfer ke</h2>
          <div className="mt-4 flex items-center gap-4">
            {method.imageUrl && (
              <img
                src={method.imageUrl}
                alt={method.name}
                className="h-8 w-16 object-contain"
              />
            )}
            <div className="flex-1">
              <p className="text-lg font-extrabold tracking-wide">
                {method.virtualAccountNumber || "-"}
              </p>
              <p className="text-base text-slate-500">
                {method.name} · a.n. {method.virtualAccountName || "-"}
              </p>
            </div>
            {pending && method.virtualAccountNumber && (
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg bg-orange-50 px-3 py-2 text-base font-bold text-accent"
              >
                {copied ? "Tersalin ✓" : "Salin"}
              </button>
            )}
          </div>

          <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-base">
            <div className="flex justify-between font-extrabold">
              <span>Total tagihan</span>
              <span className="text-primary">
                {formatPrice(transaction.totalAmount)}
              </span>
            </div>
            {pending && (
              <p className={expired ? "text-red-600" : "text-slate-500"}>
                {expired ? "Batas bayar sudah lewat: " : "Bayar sebelum "}
                {formatDateTime(transaction.expiredDate)}
              </p>
            )}
          </div>
        </div>

        {/* Bukti pembayaran */}
        <div className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-extrabold">Bukti Pembayaran</h2>

          {transaction.proofPaymentUrl ? (
            <a
              href={transaction.proofPaymentUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block break-all text-base font-bold text-primary"
            >
              Lihat bukti yang sudah dikirim ↗
            </a>
          ) : (
            <p className="mt-3 text-base text-slate-500">
              Belum ada bukti pembayaran.
            </p>
          )}

          {/* Form hanya untuk pending yang belum kedaluwarsa.
              API tetap menerima bukti untuk transaksi yang sudah
              dibatalkan, jadi pembatasan ini wajib ada di sisi kita. */}
          {pending && !expired && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="mb-3 text-base text-slate-500">
                {transaction.proofPaymentUrl
                  ? "Salah kirim? Kirim ulang bukti yang benar:"
                  : "Sudah transfer? Kirim bukti pembayarannya:"}
              </p>
              <ProofPaymentForm
                busy={busy}
                onUpload={(file) => uploadProof(transaction.id, file)}
                onSaveUrl={(url) => saveProofUrl(transaction.id, url)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Rincian item */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="border-b border-slate-200 pb-4 text-base font-extrabold">
          Rincian Pesanan
        </h2>
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 border-b border-slate-100 py-4 last:border-0"
          >
            <img
              src={item.imageUrl || FALLBACK_FOOD_IMAGE}
              alt={item.name}
              className="h-14 w-14 shrink-0 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="text-base font-bold">{item.name}</p>
              <p className="text-base text-slate-500">
                {item.quantity} x {formatPrice(item.price)}
              </p>
            </div>
            <p className="text-base font-bold">
              {formatPrice(Number(item.price) * Number(item.quantity))}
            </p>
          </div>
        ))}

        <div className="flex justify-between border-t border-slate-200 pt-4 text-base font-extrabold">
          <span>Total harga item</span>
          <span>{formatPrice(itemsTotal)}</span>
        </div>
        {itemsTotal !== transaction.totalAmount && (
          <p className="mt-2 text-xs text-slate-400">
            Total tagihan dari server ({formatPrice(transaction.totalAmount)})
            belum menghitung jumlah porsi. Ini keterbatasan API.
          </p>
        )}
      </div>

      {pending && (
        <button
          type="button"
          onClick={handleCancel}
          disabled={busy}
          className="mt-6 rounded-lg border border-red-200 px-5 py-3 text-base font-bold text-red-600 disabled:opacity-50"
        >
          {busy ? "Memproses..." : "Batalkan Pesanan"}
        </button>
      )}
    </section>
  );
}
