/**
 * Format a price in cents to a currency string.
 * e.g. 999n, "usd" → "$9.99"
 */
export function formatPrice(priceInCents: bigint, currency: string): string {
  const amount = Number(priceInCents) / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}

/**
 * Format a timestamp (nanoseconds) to a locale date string.
 */
export function formatDate(nanos: bigint): string {
  const ms = Number(nanos / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Truncate a principal string for display.
 */
export function truncatePrincipal(principal: string, chars = 8): string {
  if (principal.length <= chars * 2 + 3) return principal;
  return `${principal.slice(0, chars)}…${principal.slice(-chars)}`;
}
