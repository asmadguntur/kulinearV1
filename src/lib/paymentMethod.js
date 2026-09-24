import { TRANSACTION_STATUS, isPending } from "@/lib/transaction";

// Menggabungkan daftar bank dengan transaksi (dari store admin) menjadi
// satu baris statistik per bank.
export function buildPaymentStats(methods, transactions) {
  return methods.map((method) => {
    const related = transactions.filter(
      (item) => item.paymentMethodId === method.id,
    );
    const success = related.filter(
      (item) => item.status === TRANSACTION_STATUS.SUCCESS,
    );

    // Nomor VA tidak ada di /payment-methods, tapi ikut di payment_method
    // milik transaksi. Nomornya sama untuk semua transaksi bank yang sama,
    // jadi cukup ambil dari transaksi pertama yang ditemukan.
    const detail = related.find((item) => item.payment_method)?.payment_method;

    return {
      ...method,
      virtualAccountNumber: detail?.virtualAccountNumber || null,
      virtualAccountName: detail?.virtualAccountName || null,
      totalCount: related.length,
      pendingCount: related.filter(isPending).length,
      successCount: success.length,
      // Memakai totalAmount dari server (tagihan resmi). Ingat: server
      // mengabaikan quantity, lihat TRANSACTION.md bagian Kenali API-nya.
      revenue: success.reduce(
        (sum, item) => sum + Number(item.totalAmount || 0),
        0,
      ),
    };
  });
}
