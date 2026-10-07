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

const plural = (count: number, unit: string) =>
  `${count} ${unit}${count === 1 ? "" : "s"}`;

// Billing period, e.g. "1 Month (7 Sep 2026 - 7 Oct 2026)" or "7 Days Trial (...)".
// Apple/Google sandbox periods are minutes long (1 month = 5 minutes), so
// periods under a day show in minutes/hours with times instead of "-".
export const planDuration = (
  start?: string | null,
  end?: string | null,
  isTrial = false,
  isSandbox = false,
) => {
  if (!start || !end) return "-";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return "-";

  const minutes = Math.round(ms / 60000);
  const days = Math.round(ms / (24 * 3600 * 1000));
  let length: string;
  if (minutes < 60) length = plural(Math.max(minutes, 1), "Minute");
  else if (minutes < 24 * 60) length = plural(Math.round(minutes / 60), "Hour");
  else if (days < 28) length = plural(days, "Day");
  else {
    const months = Math.round(days / 30.44);
    length = months < 12 ? plural(months, "Month") : plural(Math.round(months / 12), "Year");
  }

  const range =
    minutes < 24 * 60
      ? `${formatDate(start)} ${formatTime(start)} - ${formatTime(end)}`
      : `${formatDate(start)} - ${formatDate(end)}`;
  const tags = [isTrial && "Trial", isSandbox && "Sandbox"].filter(Boolean).join(", ");
  return `${length}${tags ? ` ${tags}` : ""} (${range})`;
};
