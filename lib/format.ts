/**
 * Shared formatting utilities — currency, dates, relative time.
 * Import from "@/lib/format" everywhere instead of using Intl directly.
 */

/**
 * Format a numeric amount as Nigerian Naira (or another currency).
 * e.g. formatCurrency(150000) → "₦150,000.00"
 */
export function formatCurrency(
  amount: number,
  currency: string = "NGN",
  locale: string = "en-NG",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string into a human-readable medium date + short time.
 * e.g. "May 27, 2026, 2:15 PM"
 * Returns "" for null/invalid inputs.
 */
export function formatDate(
  dateStr: string | null | undefined,
  locale: string = "en-NG",
): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Format a date string as a relative time from now.
 * e.g. "3m ago", "2h ago", "5d ago"
 * Returns "" for null/invalid inputs.
 */
export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}
