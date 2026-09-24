import { useState } from "react";
import { Link } from "react-router";

import { getErrorMessage } from "@/api/client";
import TransactionStatusBadge from "@/components/TransactionStatusBadge";
import { ROUTES } from "@/constants";
import { useMyTransactions } from "@/hooks/useTransactions";
import { formatDateTime, formatPrice } from "@/lib/format";
import { STATUS_FILTERS } from "@/lib/transaction";

export default function TransactionPage() {
  const { transactions, loading, error } = useMyTransactions();

  const [statusFilter, setStatusFilter] = useState("");

  const visible = statusFilter
    ? transactions.filter((t) => t.status === statusFilter)
    : transactions;

  return (
    <section className="mx-auto max-w-[1110px] px-5 py-8">
      <p className="text-base font-bold uppercase tracking-[0.18em] text-accent">
        Riwayat
      </p>
      <h1 className="mt-2 text-2xl font-extrabold">Pesanan Saya</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            aria-pressed={statusFilter === filter.value}
            className={`rounded-full px-4 py-2 text-base font-bold ${
              statusFilter === filter.value
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading && <p className="mt-6 text-slate-500">Memuat pesanan...</p>}

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-3 text-base text-red-700">
          Gagal memuat pesanan: {getErrorMessage(error)}
        </p>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-base text-slate-500">
          {transactions.length === 0
            ? "Kamu belum punya pesanan."
            : "Tidak ada pesanan dengan status ini."}
          <div className="mt-4">
            <Link to={ROUTES.FOODS} className="font-bold text-primary">
              Jelajahi Makanan →
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="mt-6 space-y-4">
          {visible.map((transaction) => {
            const items = transaction.transaction_items || [];
            const first = items[0];
            return (
              <Link
                key={transaction.id}
                to={ROUTES.TRANSACTION_DETAIL(transaction.id)}
                className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-primary"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-extrabold text-navy">
                      {transaction.invoiceId}
                    </p>
                    <p className="text-base text-slate-500">
                      {formatDateTime(transaction.orderDate)}
                    </p>
                  </div>
                  <TransactionStatusBadge transaction={transaction} />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <p className="text-base text-slate-600">
                    {first?.name || "-"}
                    {items.length > 1 && (
                      <span className="text-slate-400">
                        {" "}
                        +{items.length - 1} menu lainnya
                      </span>
                    )}
                  </p>
                  <p className="text-base font-extrabold text-primary">
                    {formatPrice(transaction.totalAmount)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
