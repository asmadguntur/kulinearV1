import { Link, useNavigate } from "react-router";

import PaymentMethodPicker from "@/components/PaymentMethodPicker";
import { ROUTES } from "@/constants";
import { FALLBACK_FOOD_IMAGE } from "@/data/demoFoods";
import { useCart } from "@/hooks/useCart";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useMyTransactions } from "@/hooks/useTransactions";
import { authStorage } from "@/lib/authStorage";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const navigate = useNavigate();
  const cart = useCart();
  const payment = usePaymentMethods();
  // enabled: false → halaman ini cukup memakai checkout(), tanpa memuat daftar.
  const { checkout, submitting, actionError } = useMyTransactions({
    enabled: false,
  });
  const user = authStorage.getUser();
  const [paymentMethodId, setPaymentMethodId] = useState("");

  const subtotal = cart.carts.reduce((total, item) => {
    const food = item.food ?? item;
    return total + Number(food.price || 0) * Number(item.quantity || 0);
  }, 0);

  const handleCheckout = async () => {
    const result = await checkout({
      cartIds: cart.carts.map((item) => item.id),
      paymentMethodId,
    });
    if (!result.ok) return;

    // Server sudah menghapus item yang di-checkout dari keranjang.
    // Ambil ulang supaya badge di Navbar ikut menjadi 0.
    await cart.refetch();
    navigate(
      result.transactionId
        ? ROUTES.TRANSACTION_DETAIL(result.transactionId)
        : ROUTES.TRANSACTIONS,
    );
  };

  if (cart.loading)
    return (
      <section className="mx-auto max-w-7xl px-5 py-14 text-slate-500">
        Memuat keranjang...
      </section>
    );

  if (cart.carts.length === 0)
    return (
      <section className="mx-auto max-w-[1110px] px-5 py-14 text-center">
        <h1 className="text-2xl font-extrabold">Keranjang masih kosong</h1>
        <p className="mt-2 text-base text-slate-500">
          Yuk pilih menu favoritmu dulu.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to={ROUTES.FOODS}
            className="rounded-lg bg-accent px-5 py-3 text-base font-bold text-white"
          >
            Jelajahi Makanan
          </Link>
          <Link
            to={ROUTES.TRANSACTIONS}
            className="rounded-lg border border-slate-200 px-5 py-3 text-base font-bold text-navy"
          >
            Lihat Pesanan Saya
          </Link>
        </div>
      </section>
    );

  return (
    <section className="mx-auto max-w-[1110px] px-5 py-8">
      <div className="mb-7">
        <p className="text-base font-bold uppercase tracking-[0.18em] text-accent">
          Checkout
        </p>
        <h1 className="mt-2 text-2xl font-extrabold">Keranjang & Checkout</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-extrabold">Alamat Pengiriman</h2>
            <p className="mt-4 text-base font-bold">Rumah {user?.name}</p>
            <p className="mt-1 text-base text-slate-500">
              {user?.address || "Alamat tidak tersedia"}
            </p>
          </div>

          {/* Order List */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="border-b border-slate-200 pb-4 text-base font-extrabold">
              Daftar Pesanan
            </h2>
            {cart.carts.map((item) => {
              const food = item.food ?? item;
              const img = food.imageUrl || FALLBACK_FOOD_IMAGE;

              return (
                <div
                  key={item.id}
                  className="flex gap-4 border-b border-slate-100 py-4 last:border-0"
                >
                  <img
                    src={img}
                    alt={food.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <p className="text-base font-bold">{food.name}</p>

                    <p className="mt-1 text-base text-slate-500">
                      {item.quantity} x {formatPrice(Number(food.price))}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          cart.changeQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1 || cart.isPending(item.id)}
                        className="h-8 w-8 rounded border border-slate-200 font-bold disabled:opacity-50"
                      >
                        −
                      </button>

                      <span className="font-bold">{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() =>
                          cart.changeQuantity(item.id, item.quantity + 1)
                        }
                        disabled={cart.isPending(item.id)}
                        className="h-8 w-8 rounded border border-slate-200 font-bold disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => cart.removeItem(item.id)}
                    disabled={cart.isPending(item.id)}
                    className="text-base text-red-400 disabled:opacity-50"
                  >
                    {cart.isPending(item.id) ? "Menghapus..." : "Hapus"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Payment Method: dari GET /payment-methods */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="border-b border-slate-200 pb-4 text-base font-extrabold">
              Metode Pembayaran
            </h2>

            {payment.loading && (
              <p className="mt-4 text-base text-slate-500">
                Memuat metode pembayaran...
              </p>
            )}
            {payment.error && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-base text-red-700">
                Gagal memuat metode pembayaran: {getErrorMessage(payment.error)}
              </p>
            )}

            <div
              role="radiogroup"
              aria-label="Metode pembayaran"
              className="mt-4 grid gap-3 sm:grid-cols-2"
            >
              {payment.methods.map((method) => {
                const active = method.id === paymentMethodId;
                return (
                  <button
                    key={method.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setPaymentMethodId(method.id)}
                    className={`flex items-center gap-3 rounded-lg p-3 text-left text-base font-bold ${
                      active
                        ? "border-2 border-primary text-navy"
                        : "border border-slate-200 text-slate-600"
                    }`}
                  >
                    <img
                      src={method.imageUrl}
                      alt=""
                      className="h-6 w-12 object-contain"
                    />
                    Transfer {method.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="border-b border-slate-200 pb-4 text-base font-extrabold">
            Ringkasan Pesanan
          </h2>
          <div className="space-y-3 py-4 text-base">
            <div className="flex justify-between text-slate-500">
              <span>Total Harga ({cart.totalQuantity} Barang)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-4 font-extrabold">
            <span>Total Pembayaran</span>
            <span className="text-primary">{formatPrice(subtotal)}</span>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={submitting}
            className="mt-5 w-full rounded-lg bg-accent py-3 text-base font-bold text-white disabled:opacity-50"
          >
            {submitting ? "Membuat transaksi..." : "Buat Transaksi"}
          </button>

          {actionError && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-base text-red-700">
              {actionError}
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
