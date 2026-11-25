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

/**
 * The link's role segment from the profile's userMode, exactly as the app
 * builds and reads it (DeepLinks.roleOf / DeepLinks.userModes): the app opens
 * the screen for that role (model: Model Mansion book for the model
 * themselves, else the Model Market book; other roles: their profile page).
 * The backend spells agency "AGNECY"; lower-case or path forms are accepted.
 */
const ROLE_PATHS: Record<string, string> = {
  MODEL: "model",
  DESIGNER: "designer",
  PHOTOGRAPHER: "photographer",
  BRAND: "brand",
  AGNECY: "agency",
  AGENCY: "agency",
  STYLIST: "stylist",
  HAIRSTYLE: "stylist",
};

export const profileRolePath = (userMode?: string | null): string | null =>
  ROLE_PATHS[String(userMode || "").trim().toUpperCase()] ?? null;

/** https://<link host>/profile/<role>/<userId>; null for an unknown role or id. */
export const profileShareUrl = (userMode: string | null | undefined, userId: string) => {
  const role = profileRolePath(userMode);
  if (!role || !/^[a-f0-9]{24}$/i.test(String(userId || ""))) return null;
  return `${linkOrigin()}/profile/${role}/${userId}`;
};

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