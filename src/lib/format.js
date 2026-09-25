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

// "2026-09-25T12:35:00.000Z" -> "25 Sep 2026, 19.35 WIB"
// timeZone dikunci ke Asia/Jakarta, jadi hasilnya selalu WIB walaupun
// laptop penggunanya diatur ke zona waktu lain.
export function formatDateTimeWIB(value) {
  if (!value) return "-";
  const text = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
  return `${text} WIB`;
}
