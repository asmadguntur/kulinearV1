import { useState } from "react";

import { getErrorMessage } from "@/api/client";
// Logo bank dari CDN. Kalau gambar gagal dimuat, tampilkan huruf depan
// nama bank, jangan ikon gambar rusak.
export function BankLogo({ method, className = "h-6 w-12" }) {
  // State tampilan milik satu <img>, jadi cukup useState, bukan store.
  const [broken, setBroken] = useState(false);

  if (broken || !method.imageUrl)
    return (
      <span
        className={`${className} grid shrink-0 place-items-center rounded bg-slate-100 text-xs font-bold text-slate-500`}
      >
        {method.name.charAt(0)}
      </span>
    );

  return (
    <img
      src={method.imageUrl}
      alt=""
      onError={() => setBroken(true)}
      className={`${className} shrink-0 object-contain`}
    />
  );
}

export default function PaymentMethodPicker({
  methods,
  selectedId,
  onSelect,
  loading,
  error,
  onRetry,
}) {
  if (loading)
    return (
      <p className="mt-4 text-base text-slate-500">
        Memuat metode pembayaran...
      </p>
    );

  if (error)
    return (
      <div className="mt-4 rounded-lg bg-red-50 p-3 text-base text-red-700">
        Gagal memuat metode pembayaran: {getErrorMessage(error)}
        <button
          type="button"
          onClick={onRetry}
          className="ml-2 font-bold underline"
        >
          Coba lagi
        </button>
      </div>
    );

  if (methods.length === 0)
    return (
      <p className="mt-4 text-base text-slate-500">
        Belum ada metode pembayaran.
      </p>
    );

  return (
    <div
      role="radiogroup"
      aria-label="Metode pembayaran"
      className="mt-4 grid gap-3 sm:grid-cols-2"
    >
      {methods.map((method) => {
        const active = method.id === selectedId;
        return (
          <button
            key={method.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(method.id)}
            className={`flex items-center gap-3 rounded-lg p-3 text-left text-base font-bold ${
              active
                ? "border-2 border-primary text-navy"
                : "border border-slate-200 text-slate-600"
            }`}
          >
            <BankLogo method={method} />
            <span className="flex-1">Transfer {method.name}</span>
            {active && (
              <span aria-hidden="true" className="text-primary">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
