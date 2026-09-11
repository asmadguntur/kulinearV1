const WINDOW_SIZE = 5;

// Ambil maksimal 5 nomor halaman di sekitar halaman aktif, supaya tombolnya
// tidak meluber saat jumlah halaman banyak.
function visiblePages(page, totalPages) {
  const size = Math.min(WINDOW_SIZE, totalPages);
  let start = page - Math.floor(size / 2);
  start = Math.max(1, Math.min(start, totalPages - size + 1));
  return Array.from({ length: size }, (_, index) => start + index);
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const buttonClass = (isActive) =>
    `min-w-10 rounded-lg border px-3 py-2 text-base font-bold ${
      isActive
        ? "border-primary bg-primary text-white"
        : "border-slate-200 bg-white text-navy hover:border-primary"
    } disabled:cursor-not-allowed disabled:opacity-40`;

  return (
    <nav
      aria-label="Navigasi halaman"
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={buttonClass(false)}
      >
        ‹ Sebelumnya
      </button>
      {visiblePages(page, totalPages).map((number) => (
        <button
          key={number}
          onClick={() => onChange(number)}
          aria-current={number === page ? "page" : undefined}
          className={buttonClass(number === page)}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className={buttonClass(false)}
      >
        Berikutnya ›
      </button>
    </nav>
  );
}
