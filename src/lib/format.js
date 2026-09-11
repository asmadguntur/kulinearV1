export function formatPrice(value) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
}
