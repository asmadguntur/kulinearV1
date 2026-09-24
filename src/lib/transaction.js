// Semua aturan soal status dikumpulkan di sini supaya
// halaman user dan halaman admin memakai aturan yang sama.

export const TRANSACTION_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

// Label & warna untuk tiap status. "expired" bukan status dari API,
// tapi hasil hitungan isExpired() di bawah.
export const STATUS_LABELS = {
  pending: {
    label: "Menunggu Pembayaran",
    className: "bg-amber-50 text-amber-700",
  },
  expired: { label: "Kedaluwarsa", className: "bg-slate-100 text-slate-500" },
  success: { label: "Berhasil", className: "bg-emerald-50 text-emerald-700" },
  failed: { label: "Ditolak", className: "bg-red-50 text-red-700" },
  cancelled: { label: "Dibatalkan", className: "bg-slate-100 text-slate-500" },
};

// Pilihan filter di halaman daftar. value "" berarti semua status.
export const STATUS_FILTERS = [
  { value: "", label: "Semua" },
  { value: TRANSACTION_STATUS.PENDING, label: "Menunggu" },
  { value: TRANSACTION_STATUS.SUCCESS, label: "Berhasil" },
  { value: TRANSACTION_STATUS.FAILED, label: "Ditolak" },
  { value: TRANSACTION_STATUS.CANCELLED, label: "Dibatalkan" },
];

// Server tidak pernah mengubah "pending" menjadi kedaluwarsa sendiri,
// jadi kita hitung dari expiredDate.
export function isExpired(transaction) {
  return (
    transaction?.status === TRANSACTION_STATUS.PENDING &&
    new Date(transaction.expiredDate).getTime() < Date.now()
  );
}

export function isPending(transaction) {
  return transaction?.status === TRANSACTION_STATUS.PENDING;
}

// Kunci label yang dipakai badge: status asli, atau "expired".
export function getStatusKey(transaction) {
  return isExpired(transaction) ? "expired" : transaction?.status;
}

// API tidak mengurutkan dari yang terbaru. Salin dulu dengan [...list]
// supaya array aslinya tidak ikut berubah.
export function sortNewest(list) {
  return [...list].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

// Total yang benar: harga × jumlah porsi.
// totalAmount dari server mengabaikan quantity (lihat Kenali API-nya).
export function getItemsTotal(transaction) {
  return (transaction?.transaction_items || []).reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
}
