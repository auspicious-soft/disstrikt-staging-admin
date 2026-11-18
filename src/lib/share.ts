/**
 * Public share links, the same ones the app shares:
 * https://<link host>/profile/<role>/<userId>. The backend serves them at its
 * own origin (DEEP_LINK_HOST), so the host is NEXT_PUBLIC_SHARE_LINK_HOST if
 * set, else the origin of NEXT_PUBLIC_BACKEND_URL (which ends in /api).
 */
const linkOrigin = () => {
  const host = (process.env.NEXT_PUBLIC_SHARE_LINK_HOST || "").trim().replace(/\/+$/, "");
  if (host) return /^https?:\/\//.test(host) ? host : `https://${host}`;
  try {
    return new URL(process.env.NEXT_PUBLIC_BACKEND_URL || "").origin;
  } catch {
    return typeof window !== "undefined" ? window.location.origin : "";
  }
};

// role: model | designer | photographer | brand | agency | stylist
export const profileShareUrl = (role: string, userId: string) =>
  `${linkOrigin()}/profile/${role.toLowerCase()}/${userId}`;

/** Copies text; falls back to a hidden textarea where the Clipboard API is missing (http). */
export const copyText = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the textarea
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
};

/**
 * Opens the system share sheet where the browser has one; elsewhere copies
 * the link. "shared" | "copied" | "cancelled" | "failed".
 */
export const shareLink = async (url: string, title?: string) => {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title, url });
      return "shared" as const;
    } catch (err: any) {
      if (err?.name === "AbortError") return "cancelled" as const;
      // Not allowed here (e.g. no user gesture): copy instead
    }
  }
  return (await copyText(url)) ? ("copied" as const) : ("failed" as const);
};