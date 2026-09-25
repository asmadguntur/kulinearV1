import { getErrorMessage } from "@/api/client";
import { BankLogo } from "@/components/PaymentMethodPicker";
import { usePaymentMethodStats } from "@/hooks/usePaymentMethods";
import { formatPrice } from "@/lib/format";

function StatBox({ label, value, accent = "text-navy" }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-lg font-extrabold ${accent}`}>{value}</p>
    </div>
  );
}

export default function AdminPaymentMethodsPage() {
  const { stats, loading, error, refetch } = usePaymentMethodStats();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Metode Pembayaran</h1>
          <p className="mt-1 text-base text-slate-500">
            {loading ? "Memuat..." : `${stats.length} bank aktif`}
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

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-3 text-base text-red-700">
          Gagal memuat data: {getErrorMessage(error)}
        </p>
      )}

      {loading && <p className="mt-6 text-slate-500">Memuat bank...</p>}

      {!loading && !error && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {stats.map((bank) => (
            <div
              key={bank.id}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center gap-3">
                <BankLogo method={bank} className="h-8 w-16" />
                <h2 className="text-base font-extrabold">{bank.name}</h2>
              </div>

              <div className="mt-4">
                {bank.virtualAccountNumber ? (
                  <>
                    <p className="text-base font-bold tracking-wide">
                      VA {bank.virtualAccountNumber}
                    </p>
                    <p className="text-base text-slate-500">
                      a.n. {bank.virtualAccountName || "-"}
                    </p>
                  </>
                ) : (
                  <p className="text-base text-slate-400">
                    VA belum diketahui. Nomor VA baru muncul setelah bank ini
                    dipakai di sebuah transaksi.
                  </p>
                )}
              </div>

              {bank.totalCount === 0 ? (
                <p className="mt-4 rounded-lg bg-slate-50 p-3 text-base text-slate-500">
                  Belum pernah dipakai.
                </p>
              ) : (
                <>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <StatBox label="Transaksi" value={bank.totalCount} />
                    <StatBox
                      label="Menunggu"
                      value={bank.pendingCount}
                      accent="text-amber-600"
                    />
                    <StatBox
                      label="Berhasil"
                      value={bank.successCount}
                      accent="text-emerald-600"
                    />
                  </div>
                  <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-base">
                    <span className="text-slate-500">Pendapatan</span>
                    <span className="font-extrabold text-primary">
                      {formatPrice(bank.revenue)}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-slate-400">
        Daftar bank bersifat baca-saja: API tidak menyediakan endpoint untuk
        menambah, mengubah, atau menghapus bank. Pendapatan dihitung dari
        transaksi berstatus Berhasil, memakai total tagihan dari server.
      </p>
    </div>
  );
}
