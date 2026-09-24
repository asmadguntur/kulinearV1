export function formatPrice(value) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
}

// "2026-09-24T09:17:46.000Z" -> "24 Sep 2026, 16.17" (jam lokal browser)
export function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
