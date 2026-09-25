// Display helpers shared by the Model Mansion detail page and its tabs

const CURRENCY_SYMBOLS: Record<string, string> = {
  eur: "€",
  gbp: "£",
  usd: "$",
  inr: "₹",
};

export const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  en_US: "English (US)",
  nl: "Dutch",
  fr: "French",
  es: "Spanish",
};

export const titleCase = (value?: string | null) =>
  (value || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const currencySymbol = (currency?: string | null) =>
  currency ? (CURRENCY_SYMBOLS[currency.toLowerCase()] ?? currency) : "";

export const formatMoney = (amount?: number | null, currency?: string | null) =>
  `${currencySymbol(currency)}${Number(amount || 0).toLocaleString()}`;

export const formatDate = (value?: string | Date | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

export const formatTime = (value?: string | Date | null) =>
  value
    ? new Date(value).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

// "2 Hr", "3 Days", "1 Yr" style relative time used in activity lists
export const timeAgo = (value?: string | Date | null) => {
  if (!value) return "";
  const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
  const units: [number, string][] = [
    [365 * 24 * 3600, "Yr"],
    [30 * 24 * 3600, "Mo"],
    [24 * 3600, "Day"],
    [3600, "Hr"],
    [60, "Min"],
  ];
  for (const [size, label] of units) {
    const count = Math.floor(seconds / size);
    if (count >= 1) return `${count} ${label}${count > 1 && label !== "Hr" && label !== "Yr" && label !== "Min" ? "s" : ""}`;
  }
  return "Now";
};

// Billing period length, e.g. "1 Month", "6 Months", "3 Days"
export const planDuration = (start?: string | null, end?: string | null) => {
  if (!start || !end) return "-";
  const days = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / (24 * 3600 * 1000),
  );
  if (days <= 0) return "-";
  if (days < 28) return `${days} Day${days > 1 ? "s" : ""}`;
  const months = Math.round(days / 30.44);
  if (months < 12) return `${months} Month${months > 1 ? "s" : ""}`;
  const years = Math.round(months / 12);
  return `${years} Year${years > 1 ? "s" : ""}`;
};
