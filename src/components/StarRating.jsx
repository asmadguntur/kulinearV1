const STARS = [1, 2, 3, 4, 5];

export default function StarRating({
  value = 0,
  onChange,
  size = "text-xl",
  label = "Beri rating",
}) {
  // Mode baca: tidak bisa diklik, cukup gambar bintang penuh/kosong.
  if (!onChange) {
    return (
      <span
        className={`${size} text-accent`}
        role="img"
        aria-label={`${value} dari 5 bintang`}
      >
        {STARS.map((star) => (
          <span key={star} aria-hidden="true">
            {star <= Math.round(value) ? "★" : "☆"}
          </span>
        ))}
      </span>
    );
  }

  // Mode pilih: dipakai di form. role="radiogroup" supaya terbaca screen reader.
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1">
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} bintang`}
          onClick={() => onChange(star)}
          className={`${size} transition hover:scale-110 ${
            star <= value ? "text-accent" : "text-slate-300"
          }`}
        >
          {star <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
