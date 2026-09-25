import { BASE_IMG_URL } from "@/constants/apiUrls";

/**
 * Media values in the database come in several shapes:
 *  - S3 keys ("users/<id>/images/x.jpg"). Most live in this environment's
 *    bucket, but admin uploads go to the production bucket (BASE_IMG_URL).
 *  - Full URLs (Google avatars, older uploads).
 *  - S3 URLs with the bucket prefix repeated ("https://b/https://b/users/x.jpg").
 *  - Video objects { url, thumbnail }.
 * mediaCandidates returns every URL worth trying, best first.
 */
const BUCKETS = [
  ...new Set([process.env.NEXT_PUBLIC_AWS_BUCKET_PATH || "", BASE_IMG_URL].filter(Boolean)),
];

const S3_MARKER = ".amazonaws.com/";

const candidatesFor = (value: unknown): string[] => {
  const raw =
    typeof value === "string"
      ? value.trim()
      : value && typeof value === "object"
        ? String((value as any).url || (value as any).thumbnail || "").trim()
        : "";
  if (!raw) return [];

  const markerIndex = raw.lastIndexOf(S3_MARKER);
  if (markerIndex !== -1) {
    // Innermost URL of a repeated prefix, then the key in each bucket
    const start = Math.max(
      raw.lastIndexOf("https://", markerIndex),
      raw.lastIndexOf("http://", markerIndex),
    );
    const key = raw.slice(markerIndex + S3_MARKER.length).split("?")[0];
    return [raw.slice(Math.max(start, 0)), ...BUCKETS.map((bucket) => bucket + key)];
  }

  if (/^https?:\/\//i.test(raw)) return [raw];

  const key = raw.replace(/^\/+/, "");
  return BUCKETS.map((bucket) => bucket + key);
};

// Accepts one value or several (e.g. [headshot, profile image]) in priority order
export const mediaCandidates = (value: unknown | unknown[]): string[] => [
  ...new Set((Array.isArray(value) ? value : [value]).flatMap(candidatesFor)),
];

export const resolveMediaUrl = (value: unknown | unknown[]) =>
  mediaCandidates(value)[0] || "";

/** "swen sharma" -> "Swen Sharma"; leaves "QWERTY" / "McDonald" untouched. */
export const formatName = (value?: string | null) =>
  (value || "")
    .trim()
    .replace(/(^|[\s\-'’])(\p{Ll})/gu, (_, before: string, letter: string) => before + letter.toUpperCase());
