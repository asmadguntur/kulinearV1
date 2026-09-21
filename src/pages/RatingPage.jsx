import { useState } from "react";
import { Link, useParams } from "react-router";

import { getErrorMessage } from "@/api/client";
import StarRating from "@/components/StarRating";
import { ROLES, ROUTES } from "@/constants";
import { useFoodDetail } from "@/hooks/useFoods";
import { useRatings } from "@/hooks/useRatings";
import { authStorage } from "@/lib/authStorage";

const STARS_DESC = [5, 4, 3, 2, 1];

export default function RatingPage() {
  const { foodId } = useParams();
  const { food } = useFoodDetail(foodId);
  const {
    ratings,
    loading,
    error,
    actionError,
    submitting,
    total,
    average,
    distribution,
    submitRating,
  } = useRatings(foodId);

  // Memberi rating hanya untuk role user, sama seperti favorit dan keranjang.
  const isUser = authStorage.getUser()?.role === ROLES.USER;

  // State form: lokal saja, tidak perlu masuk store.
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    const saved = await submitRating({ rating, review });
    if (!saved) return;
    // Kosongkan form supaya jelas ulasannya sudah terkirim.
    setRating(0);
    setReview("");
    setSuccessMessage("Terima kasih, ulasan kamu sudah tersimpan.");
  };

  return (
    <section className="mx-auto max-w-[1110px] px-5 py-8">
      <Link
        to={ROUTES.FOOD_DETAIL(foodId)}
        className="text-base font-semibold text-slate-500"
      >
        {food?.name || "Detail Makanan"} <span className="mx-2">/</span>
        <span className="text-navy">Rating & Ulasan</span>
      </Link>

      <h1 className="mt-4 text-2xl font-extrabold">Rating & Ulasan</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Ringkasan rata-rata + sebaran bintang */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-5">
            <strong className="text-4xl">
              {total > 0 ? average.toFixed(1) : "-"}
            </strong>
            <div>
              <StarRating value={average} />
              <p className="mt-1 text-base text-slate-500">{total} ulasan</p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {STARS_DESC.map((star) => {
              const count = distribution[star];
              // Lebar bar dalam persen. Dijaga supaya tidak membagi dengan nol.
              const percent = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-base">
                  <span className="w-10 shrink-0 text-slate-500">{star} ★</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-accent"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-slate-500">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form: khusus role user */}
        {isUser ? (
          <form
            onSubmit={handleSubmit}
            className="h-fit rounded-xl border border-slate-200 bg-white p-5"
          >
            <h2 className="text-base font-extrabold">Beri Rating Kamu</h2>

            <div className="mt-4">
              <StarRating
                value={rating}
                onChange={setRating}
                size="text-3xl"
                label="Pilih jumlah bintang"
              />
            </div>

            <label
              htmlFor="review"
              className="mt-5 block text-base font-bold text-navy"
            >
              Ulasan
            </label>
            <textarea
              id="review"
              value={review}
              onChange={(event) => setReview(event.target.value)}
              rows={4}
              maxLength={300}
              placeholder="Ceritakan pengalamanmu menikmati menu ini..."
              className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-base outline-none focus:border-primary"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {review.length}/300
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="mt-3 w-full rounded-lg bg-primary py-3 text-base font-bold text-white disabled:opacity-50"
            >
              {submitting ? "Mengirim..." : "Kirim Ulasan"}
            </button>

            {actionError && (
              <p className="mt-3 rounded-lg bg-red-50 p-3 text-base text-red-700">
                {actionError}
              </p>
            )}
            {successMessage && (
              <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-base text-emerald-700">
                {successMessage}
              </p>
            )}
          </form>
        ) : (
          <div className="h-fit rounded-xl border border-dashed border-slate-300 p-5 text-base text-slate-500">
            Hanya akun pembeli yang bisa memberi rating.
          </div>
        )}
      </div>

      {/* Daftar ulasan */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="border-b border-slate-200 pb-4 text-base font-extrabold">
          Ulasan Pembeli
        </h2>

        {loading && <p className="pt-4 text-slate-500">Memuat ulasan...</p>}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-base text-red-700">
            Gagal memuat ulasan: {getErrorMessage(error)}
          </p>
        )}

        {!loading && !error && total === 0 && (
          <p className="pt-4 text-slate-500">
            Belum ada ulasan untuk menu ini. Jadilah yang pertama!
          </p>
        )}

        {!loading &&
          !error &&
          ratings.map((item) => {
            const user = item.user || {};
            return (
              <div
                key={item.id}
                className="flex gap-4 border-b border-slate-100 py-4 last:border-0"
              >
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={user.name}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-50 font-bold text-accent">
                    {(user.name || "?").charAt(0).toUpperCase()}
                  </span>
                )}

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-base font-bold">
                      {user.name || "Pengguna"}
                    </p>
                    <StarRating value={item.rating} size="text-base" />
                  </div>
                  <p className="mt-1 text-base text-slate-500">
                    {item.review || "-"}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}
