import { Link } from "react-router";

import { ROUTES } from "@/constants";
import { authStorage } from "@/lib/authStorage";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/hooks/useCart";

const SHIPPING_COST = 10000;
const DISCOUNT = 5000;

export default function CartPage() {
  const cart = useCart();
  const user = authStorage.getUser();
  const subtotal = cart.carts.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 0),
    0,
  );
  const discount = cart.carts.length > 0 ? DISCOUNT : 0;
  const total = subtotal + SHIPPING_COST - discount;

  if (cart.loading)
    return (
      <section className="mx-auto max-w-7xl px-5 py-14 text-slate-500">
        Memuat keranjang...
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
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="border-b border-slate-200 pb-4 text-base font-extrabold">
              Daftar Pesanan
            </h2>
            {cart.carts.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 border-b border-slate-100 py-4 last:border-0"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-base font-bold">{item.name}</p>
                  <p className="mt-1 text-base text-slate-500">
                    {item.quantity}x × {formatPrice(item.price)}
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
                  onClick={() => cart.removeItem(item.id)}
                  disabled={cart.isPending(item.id)}
                  className="text-base text-red-400"
                >
                  {cart.isPending(item.id) ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="border-b border-slate-200 pb-4 text-base font-extrabold">
              Metode Pembayaran
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <button className="rounded-lg border-2 border-primary p-3 text-left text-base font-bold text-navy">
                ◉　Transfer Bank BCA
              </button>
              <button className="rounded-lg border border-slate-200 p-3 text-left text-base font-bold text-slate-600">
                ○　GoPay / ShopeePay
              </button>
              <button className="rounded-lg border border-slate-200 p-3 text-left text-base font-bold text-slate-600">
                ○　OVO / DANA
              </button>
            </div>
          </div>
        </div>
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="border-b border-slate-200 pb-4 text-base font-extrabold">
            Ringkasan Pesanan
          </h2>
          <div className="space-y-3 py-4 text-base">
            <div className="flex justify-between text-slate-500">
              <span>Total Harga ({cart.totalQuantity} Barang)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Ongkos Kirim</span>
              <span>{formatPrice(SHIPPING_COST)}</span>
            </div>
            <div className="flex justify-between text-emerald-500">
              <span>Diskon Promo</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-4 font-extrabold">
            <span>Total Pembayaran</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
          <Link
            to={ROUTES.TRANSACTIONS}
            className="mt-5 block rounded-lg bg-accent py-3 text-center text-base font-bold text-white"
          >
            Buat Transaksi
          </Link>
        </aside>
      </div>
    </section>
  );
}
