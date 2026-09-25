/**
 * Staff session (stored at login by useLogin) and role-based routing.
 *
 * Only FOUNDER and AGENT accounts have a panel. This is the UI side of the
 * rule; the backend enforces it too (/api/admin is FOUNDER only, /api/agent
 * is AGENT only), so editing localStorage can't grant access to data.
 */
export type StaffRole = "FOUNDER" | "AGENT" | "SCOUT" | "COACH" | "MANAGER";

const PANEL_HOME: Partial<Record<StaffRole, string>> = {
  FOUNDER: "/admin/dashboard",
  AGENT: "/agent/dashboard",
};

export const homeForRole = (role?: string | null) =>
  (role && PANEL_HOME[role as StaffRole]) || null;

export const getSession = () => {
  if (typeof window === "undefined") return { token: null, role: null, admin: null };
  let admin: any = null;
  try {
    admin = JSON.parse(localStorage.getItem("admin") || "null");
  } catch {
    admin = null;
  }
  return {
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
    admin,
  };
};

export const clearSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("admin");
};

export const NO_PANEL_MESSAGE =
  "Your account doesn't have access to the admin panel yet. Please contact a founder.";
