const DAY_MS = 24 * 60 * 60 * 1000;

// Nomor hari sejak epoch. Dipakai sebagai titik awal rotasi supaya daftar
// rekomendasi tetap sama sepanjang hari dan berganti sendiri setiap tanggal baru.
function dayNumber(date) {
  return Math.floor(date.getTime() / DAY_MS);
}

export function pickDailyRecommendations(foods, count = 8, date = new Date()) {
  if (!foods.length) return [];
  const size = Math.min(count, foods.length);
  const offset = dayNumber(date) % foods.length;
  return Array.from(
    { length: size },
    (_, index) => foods[(offset + index) % foods.length],
  );
}
