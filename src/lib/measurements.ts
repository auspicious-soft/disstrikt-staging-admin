/**
 * Measurement display per country, ported 1:1 from the Flutter app
 * (ModelPortfolioController: heightFromCm / measurementFromCm / shoeSizeFromUK).
 *
 * The backend stores body measurements in cm and shoe size as a UK size.
 * - BE / FR / NL / ES: cm, EU shoe size
 * - UK / US: feet + inches for height, inches for the rest, UK / US shoe size
 * Any other or missing country falls back to "ES" (cm), like the app does.
 */

export type CountryCode = "UK" | "US" | "BE" | "FR" | "NL" | "ES";

const CM_COUNTRIES = new Set(["BE", "FR", "NL", "ES"]);

const COUNTRY_NAMES: Record<string, CountryCode> = {
  "UNITED KINGDOM": "UK",
  "UNITED STATES": "US",
  BELGIUM: "BE",
  FRANCE: "FR",
  NETHERLANDS: "NL",
  SPAIN: "ES",
};

/** Accepts the stored code ("UK") or the full name ("United Kingdom"). */
export const toCountryCode = (country?: string | null): CountryCode => {
  const value = String(country || "").trim().toUpperCase();
  if (["UK", "US", "BE", "FR", "NL", "ES"].includes(value)) return value as CountryCode;
  return COUNTRY_NAMES[value] || "ES";
};

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
};

// Dart's GetX double.toPrecision(n)
const toPrecision = (value: number, digits: number) => Number(value.toFixed(digits));

// Dart prints whole doubles with ".0" (172.0), which the app shows as is
const dartDouble = (value: number) =>
  Number.isInteger(value) ? `${value}.0` : String(value);

// Flutter _formatMeasurement: whole numbers without decimals, else up to 2
const formatMeasurement = (value: number) =>
  value === Math.round(value)
    ? String(Math.trunc(value))
    : value.toFixed(2).replace(/\.?0+$/, "");

/** Unit labels for a country: cm / ft-in / in, and the shoe size system. */
export const measurementUnits = (country?: string | null) => {
  const code = toCountryCode(country);
  const metric = CM_COUNTRIES.has(code);
  return {
    height: metric ? "cm" : "ft/in",
    length: metric ? "cm" : "in",
    shoe: metric ? "EU" : code, // "UK" or "US"
  };
};

/** Height (stored in cm): "172.0 cm" or 5'8" */
export const heightFromCm = (country: string | null | undefined, heightCm: unknown) => {
  const cm = toNumber(heightCm);
  if (cm === null || cm <= 0) return null;

  if (CM_COUNTRIES.has(toCountryCode(country))) {
    return `${dartDouble(toPrecision(cm, 2))} cm`;
  }

  // UK / US → feet + inches
  const totalInches = cm / 2.54;
  const feet = Math.trunc(totalInches / 12);
  const inches = Math.round(totalInches % 12);

  // Rounding 11.6" → 12"
  if (inches === 12) return `${feet + 1}'0"`;
  return `${feet}'${inches}"`;
};

/** Any other body measurement (stored in cm): "64.5 cm" or 25.39" */
export const measurementFromCm = (
  country: string | null | undefined,
  measurementCm: unknown,
) => {
  const cm = toNumber(measurementCm);
  if (cm === null || cm <= 0) return null;

  if (CM_COUNTRIES.has(toCountryCode(country))) {
    return `${formatMeasurement(cm)} cm`;
  }

  // UK / US → inches
  return `${formatMeasurement(cm / 2.54)}"`;
};

/**
 * Shoe size (stored as UK) in the country's system. null when it can't be
 * converted: no size, or a non-UK country without MALE / FEMALE gender.
 */
export const shoeSizeFromUK = (
  country: string | null | undefined,
  ukShoeSize: unknown,
  gender: string | null | undefined,
) => {
  const uk = toNumber(ukShoeSize);
  if (uk === null || uk <= 0) return null;

  const countryCode = toCountryCode(country);
  const genderCode = String(gender || "").toUpperCase();

  if (countryCode === "UK") return dartDouble(uk);

  if (genderCode === "MALE") {
    if (countryCode === "US") return dartDouble(toPrecision(uk + 3.5, 1)); // UK 6 → US 9.5
    if (CM_COUNTRIES.has(countryCode)) return dartDouble(toPrecision(uk + 34, 1)); // UK 6 → EU 40
  }

  if (genderCode === "FEMALE") {
    if (countryCode === "US") return dartDouble(toPrecision(uk + 2.5, 1)); // UK 1 → US 3.5
    if (CM_COUNTRIES.has(countryCode)) return dartDouble(toPrecision(uk + 33, 1)); // UK 1 → EU 34
  }

  return null;
};
