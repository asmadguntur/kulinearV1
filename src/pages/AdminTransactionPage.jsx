import { useMemo, useState } from "react";

import { getErrorMessage } from "@/api/client";
import Pagination from "@/components/Pagination";
import TransactionStatusBadge from "@/components/TransactionStatusBadge";
import { useAdminTransactions } from "@/hooks/useTransactions";
import { formatDateTime, formatPrice } from "@/lib/format";
import {
  STATUS_FILTERS,
  TRANSACTION_STATUS,
  isPending,
} from "@/lib/transaction";

const PER_PAGE = 10;

export default function AdminTransactionsPage() {
  const {
    transactions,
    usersById,
    loading,
    error,
    actionError,
    isPending: isBusy,
    changeStatus,
    refetch,
  } = useAdminTransactions();

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    return transactions.filter((item) => {
      if (statusFilter && item.status !== statusFilter) return false;
      if (!text) return true;
      const buyer = usersById[item.userId] || {};
      return [item.invoiceId, buyer.name, buyer.email].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(text),
      );
    });
  }, [transactions, usersById, keyword, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  // Jaga-jaga kalau hasil filter menyusut dan halaman aktif jadi kelebihan.
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  const handleStatus = async (transaction, status) => {
    const label = status === TRANSACTION_STATUS.SUCCESS ? "TERIMA" : "TOLAK";
    const warning = transaction.proofPaymentUrl
      ? ""
      : "\nPerhatian: transaksi ini belum punya bukti pembayaran.";
    if (
      !window.confirm(
        `${label} transaksi ${transaction.invoiceId}?${warning}\nStatus tidak bisa diubah lagi setelah ini.`,
      )
    )
      return;
    await changeStatus(transaction.id, status);
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Kelola Transaksi</h1>
          <p className="mt-1 text-base text-slate-500">
            {filtered.length} transaksi
            {totalPages > 1 && ` · halaman ${currentPage} dari ${totalPages}`}
          </p>
        </div>
        <button
          type="button"
          onClick={refetch}
          disabled={loading}
          className="rounded-lg border border-slate-200 px-4 py-2 text-base font-bold text-navy disabled:opacity-50"
        >
          Muat Ulang
        </button>
      </div>

      <input
        type="search"
        value={keyword}
        onChange={(event) => {
          setKeyword(event.target.value);
          setPage(1);
        }}
        placeholder="Cari invoice, nama, atau email pembeli..."
        className="mt-5 w-full border border-slate-300 bg-white px-3 py-2 text-base outline-none focus:border-primary"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => {
              setStatusFilter(filter.value);
              setPage(1);
            }}
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

      {actionError && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-base text-red-700">
          {actionError}
        </p>
      )}

      {loading && <p className="mt-6 text-slate-500">Memuat transaksi...</p>}

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-3 text-base text-red-700">
          Gagal memuat transaksi: {getErrorMessage(error)}
        </p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="mt-6 text-slate-500">Tidak ada transaksi.</p>
      )}

      {!loading && !error && (
        <div className="mt-6 space-y-4">
          {pageItems.map((transaction) => {
            const buyer = usersById[transaction.userId];
            const items = transaction.transaction_items || [];
            const busy = isBusy(transaction.id);

            return (
              <div
                key={transaction.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-extrabold text-navy">
                      {transaction.invoiceId}
                    </p>
                    <p className="text-base text-slate-500">
                      {buyer
                        ? `${buyer.name} · ${buyer.email}`
                        : "Pembeli tidak dikenal"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDateTime(transaction.orderDate)} ·{" "}
                      {transaction.payment_method?.name || "-"}
                    </p>
                  </div>
                  <div className="text-right">
                    <TransactionStatusBadge transaction={transaction} />
                    <p className="mt-2 text-base font-extrabold text-primary">
                      {formatPrice(transaction.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* <details> bisa dibuka-tutup tanpa useState. */}
                <details className="mt-3 text-base">
                  <summary className="cursor-pointer text-slate-500">
                    {items.length} menu
                  </summary>
                  <ul className="mt-2 space-y-1 text-slate-600">
                    {items.map((item) => (
                      <li key={item.id}>
                        {item.quantity} x {item.name} ({formatPrice(item.price)}
                        )
                      </li>
                    ))}
                  </ul>
                </details>

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                  {transaction.proofPaymentUrl ? (
                    <a
                      href={transaction.proofPaymentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-base font-bold text-primary"
                    >
                      Lihat Bukti ↗
                    </a>
                  ) : (
                    <span className="text-base text-slate-400">
                      Belum ada bukti
                    </span>
                  )}

                  {isPending(transaction) && (
                    <div className="ml-auto flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleStatus(transaction, TRANSACTION_STATUS.FAILED)
                        }
                        disabled={busy}
                        className="rounded-lg border border-red-200 px-4 py-2 text-base font-bold text-red-600 disabled:opacity-50"
                      >
                        Tolak
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleStatus(transaction, TRANSACTION_STATUS.SUCCESS)
                        }
                        disabled={busy}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-base font-bold text-white disabled:opacity-50"
                      >
                        {busy ? "Menyimpan..." : "Terima"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
